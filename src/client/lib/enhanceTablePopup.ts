/**
 * モバイル版 Toast UI Editor テーブルサイズ選択の操作改善
 *
 * 従来: タッチ & ドラッグ → 指を離した瞬間に即座にテーブル挿入
 * 改善: 長押しで開始 → ドラッグで範囲選択 → 指を離しても確定せず → 決定/キャンセルボタン
 */

import type { ToastUiEditorInstance } from '@/types/toastui';

/* ------------------------------------------------------------------ */
/* ポップアップの検出方法                                              */
/*                                                                    */
/* Toast UI Editor はポップアップを以下のいずれかの方法で表示する:      */
/* 1. 新しい DOM ノードを追加する (childList 変更)                     */
/* 2. 既存のノードの style.display を切り替える (属性変更)             */
/*                                                                    */
/* 確実に検出するため:                                                 */
/* - MutationObserver で childList + attributes の両方を監視           */
/* - テーブルツールバーボタンのクリックも監視（フォールバック）         */
/* - editor の openPopup イベントもリッスン                            */
/* ------------------------------------------------------------------ */

export function enhanceTablePopup(
  containerEl: HTMLElement,
  editor: ToastUiEditorInstance,
): () => void {
  const cleanedUp = { value: false };

  // ポップアップのセットアップを試行
  function trySetup() {
    if (cleanedUp.value) return;
    // containerEl 内と document 全体の両方から検索
    const popup =
      containerEl.querySelector<HTMLElement>(
        '.toastui-editor-popup-add-table:not([data-tk-enhanced])',
      ) ??
      document.querySelector<HTMLElement>(
        '.toastui-editor-popup-add-table:not([data-tk-enhanced])',
      );
    if (!popup) return;
    const display = getComputedStyle(popup).display;
    if (display === 'none') return;
    popup.dataset.tkEnhanced = 'true';
    setupTablePopup(popup, editor, containerEl, trySetup);
  }

  // 1) MutationObserver: 子ノードの追加 と 属性変更の両方を監視
  const observer = new MutationObserver(() => {
    trySetup();
  });
  observer.observe(containerEl, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  });

  // ポップアップがエディタコンテナの外部に追加される場合に備えて
  // document.body も監視（ただし containerEl の外部にあるポップアップのみ処理）
  const bodyObserver = new MutationObserver(() => {
    trySetup();
  });
  bodyObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributeFilter: ['style', 'class'],
  });

  // 2) ツールバーボタンのクリックを監視（最も確実なフォールバック）
  //    テーブルボタンがクリックされた後、少し遅延してポップアップを検索
  const handleClick = () => {
    setTimeout(trySetup, 30);
    setTimeout(trySetup, 100);
    setTimeout(trySetup, 300);
  };

  // イベントリスナーをコンテナ全体に追加（ツールバーボタンの特定不要）
  containerEl.addEventListener('click', handleClick, true);

  // 3) editor の openPopup イベントもリッスン
  try {
    editor.on('openPopup', () => {
      setTimeout(trySetup, 30);
      setTimeout(trySetup, 100);
    });
  } catch {
    // openPopup イベントが存在しない場合は無視
  }

  return () => {
    cleanedUp.value = true;
    observer.disconnect();
    bodyObserver.disconnect();
    containerEl.removeEventListener('click', handleClick, true);
  };
}

/* ------------------------------------------------------------------ */
/* 個別ポップアップのセットアップ                                       */
/* ------------------------------------------------------------------ */
function setupTablePopup(
  popup: HTMLElement,
  editor: ToastUiEditorInstance,
  containerEl: HTMLElement,
  trySetup: () => void,
) {
  const grid = popup.querySelector<HTMLElement>('.toastui-editor-table-selection');
  const table = popup.querySelector<HTMLElement>('.toastui-editor-table');
  const desc = popup.querySelector<HTMLElement>('.toastui-editor-table-description');
  const body = popup.querySelector<HTMLElement>('.toastui-editor-popup-body');
  if (!grid || !table || !body) return;

  // 内部関数で使うため非 null を確定させる
  const $grid: HTMLElement = grid;
  const $body: HTMLElement = body;

  // グリッド次元を計算し、10x10 未満であれば 10x10 に拡張する
  let rows = Array.from($grid.querySelectorAll<HTMLElement>('.toastui-editor-table-row'));
  let totalRows = rows.length;
  let totalCols = rows[0]
    ? rows[0].querySelectorAll<HTMLElement>('.toastui-editor-table-cell').length
    : 0;

  const TARGET_SIZE = 10;
  if (totalRows > 0 && totalCols > 0 && (totalRows < TARGET_SIZE || totalCols < TARGET_SIZE)) {
    const tbody = table.querySelector('tbody') || table;
    tbody.innerHTML = '';
    for (let r = 0; r < TARGET_SIZE; r++) {
      const tr = document.createElement('tr');
      tr.className = 'toastui-editor-table-row';
      for (let c = 0; c < TARGET_SIZE; c++) {
        const td = document.createElement('td');
        td.className = 'toastui-editor-table-cell';
        if (r === 0) {
          td.classList.add('header');
        }
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    rows = Array.from($grid.querySelectorAll<HTMLElement>('.toastui-editor-table-row'));
    totalRows = rows.length;
    totalCols = TARGET_SIZE;
  }

  if (totalRows === 0 || totalCols === 0) return;

  /* ---- state ---- */
  let startRow = -1;
  let startCol = -1;
  let endRow = -1;
  let endCol = -1;
  let hasSelection = false;        // mousedown で確定した選択
  let hoverRow = -1;               // ホバー中のプレビュー行
  let hoverCol = -1;               // ホバー中のプレビュー列
  let isLongPressing = false;
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;

  // 独自バッジを作成し、エディタ標準のバッジ（上書きされる）の直後に挿入
  const myDesc = document.createElement('div');
  myDesc.className = 'tk-table-description';
  myDesc.textContent = '0 x 0';

  if (desc && desc.parentNode) {
    desc.parentNode.insertBefore(myDesc, desc.nextSibling);
    // 標準バッジは非表示にする
    desc.style.setProperty('display', 'none', 'important');
  } else {
    $body.appendChild(myDesc);
  }

  function updateDescText(rows: number, cols: number) {
    myDesc.textContent = `${rows} x ${cols}`;
  }

  /* ---- セル検出: タッチ座標 → 行/列 ---- */
  function getCellAtPoint(clientX: number, clientY: number): { row: number; col: number } | null {
    // 最初のセルを起点に相対座標を求める。
    // $table.getBoundingClientRect() を使うと border-collapse の影響で
    // セル実サイズとテーブル端の関係が不安定になるため、セル同士の位置関係で計算する。
    const firstCell = rows[0]?.querySelector<HTMLElement>('.toastui-editor-table-cell');
    if (!firstCell) return null;
    const firstRect = firstCell.getBoundingClientRect();
    const relX = clientX - firstRect.left;
    const relY = clientY - firstRect.top;
    if (relX < 0 || relY < 0) return null;

    // border-collapse: collapse ではセル間の境界線が共有されるため、
    // 1セルの getBoundingClientRect().width は「隣のセルまでの移動幅」より大きい。
    // 例: width:30px + border:1px → 1セルの幅は 30px だが隣接セルまでの距離は 29px。
    // この差異が累積してカーソル位置と選択範囲がズレる原因となる。
    // そこで、隣接セル間の実際の距離（ストライド）を計算して除数に使う。
    const cellsInRow = rows[0].querySelectorAll<HTMLElement>('.toastui-editor-table-cell');
    let cellW = firstRect.width;
    let cellH = firstRect.height;

    if (cellsInRow.length > 1) {
      const secondRect = cellsInRow[1].getBoundingClientRect();
      cellW = secondRect.left - firstRect.left;
    }
    if (rows.length > 1) {
      const secondRowCell = rows[1].querySelector<HTMLElement>('.toastui-editor-table-cell');
      if (secondRowCell) {
        cellH = secondRowCell.getBoundingClientRect().top - firstRect.top;
      }
    }

    if (cellW <= 0 || cellH <= 0) return null;

    const col = Math.floor(relX / cellW);
    const row = Math.floor(relY / cellH);
    if (row < 0 || row >= totalRows || col < 0 || col >= totalCols) return null;
    return { row, col };
  }

  /* ---- 選択レイヤーの位置更新 ---- */
  function updateSelectionLayer(
    r1: number,
    c1: number,
    r2: number,
    c2: number,
  ) {
    const layer = $grid.querySelector<HTMLElement>('.toastui-editor-table-selection-layer');
    if (!layer) return;

    const mr = Math.min(r1, r2);
    const Mc = Math.min(c1, c2);
    const Mr = Math.max(r1, r2);
    const Mc2 = Math.max(c1, c2);

    // 行／列の情報を使って各セルの getBoundingClientRect を取得
    const firstCellEl = rows[mr]?.querySelectorAll<HTMLElement>('.toastui-editor-table-cell')[Mc];
    const lastCellEl = rows[Mr]?.querySelectorAll<HTMLElement>('.toastui-editor-table-cell')[Mc2];
    if (!firstCellEl || !lastCellEl) return;

    const fRect = firstCellEl.getBoundingClientRect();
    const lRect = lastCellEl.getBoundingClientRect();

    layer.style.display = 'block';
    const offsetParent = layer.offsetParent || $grid;
    const parentRect = offsetParent.getBoundingClientRect();

    layer.style.top = `${fRect.top - parentRect.top}px`;
    layer.style.left = `${fRect.left - parentRect.left}px`;
    layer.style.width = `${lRect.right - fRect.left}px`;
    layer.style.height = `${lRect.bottom - fRect.top}px`;

    hasSelection = true;
    startRow = mr;
    startCol = Mc;
    endRow = Mr;
    endCol = Mc2;

    // 説明テキスト更新
    updateDescText(Mr - mr + 1, Mc2 - Mc + 1);
  }

  /** ホバープレビュー専用: hasSelection は変えず視覚だけ更新 */
  function updateHoverLayer(r2: number, c2: number) {
    hoverRow = r2;
    hoverCol = c2;
    updateSelectionLayer(0, 0, r2, c2);
    // hasSelection をリセット（mousedown で上書きされるまで未確定扱い）
    hasSelection = false;
    startRow = startCol = endRow = endCol = -1;
  }

  function clearSelectionLayer() {
    const layer = $grid.querySelector<HTMLElement>('.toastui-editor-table-selection-layer');
    if (layer) {
      layer.style.display = 'none';
      layer.style.width = '0';
      layer.style.height = '0';
    }
    hasSelection = false;
    hoverRow = hoverCol = -1;
    startRow = startCol = endRow = endCol = -1;
    updateDescText(0, 0);
  }

  /* ================================================================ */
  /* オーバーレイ: 元のタッチ/マウスイベントをブロックし独自処理       */
  /*                                                                  */
  /* オーバーレイは $grid 内に配置し、テーブルグリッド部分のみを覆う   */
  /* ボタンは $body 直下に配置するため、オーバーレイの影響を受けない   */
  /* ================================================================ */
  const overlay = document.createElement('div');
  overlay.className = 'tk-table-overlay';
  overlay.style.cssText = [
    'position: absolute;',
    'top: 0;',
    'left: 0;',
    'width: 100%;',
    'height: 100%;',
    'z-index: 50;',
    'touch-action: none;',
    'cursor: pointer;',
    'background: transparent;',
  ].join('');

  // テーブルグリッドに position: relative を設定（オーバーレイの基準）
  $grid.style.position = 'relative';
  // 既存のオーバーレイがあれば除去
  const old = $grid.querySelector('.tk-table-overlay');
  if (old) old.remove();
  $grid.appendChild(overlay);

  /* ---- touch handlers ---- */
  overlay.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
  overlay.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
  overlay.addEventListener('touchend', onTouchEnd, { passive: false, capture: true });
  overlay.addEventListener('touchcancel', onTouchCancel, { passive: false, capture: true });

  function onTouchStart(e: TouchEvent) {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    longPressTimer = setTimeout(() => {
      isLongPressing = true;
      // 既存の選択があればリセットして新しく開始
      if (hasSelection) {
        clearSelectionLayer();
      }
      const pos = getCellAtPoint(touch.clientX, touch.clientY);
      if (pos) {
        updateSelectionLayer(pos.row, pos.col, pos.row, pos.col);
      }
    }, 300);
  }

  function onTouchMove(e: TouchEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLongPressing) {
      // 長押し確定前に移動した → キャンセル
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      return;
    }

    const touch = e.touches[0];
    const pos = getCellAtPoint(touch.clientX, touch.clientY);
    if (pos && hasSelection) {
      updateSelectionLayer(startRow, startCol, pos.row, pos.col);
    }
  }

  function onTouchEnd(e: TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    clearLongPress();
    isLongPressing = false;
    // ここではモーダルを閉じず、決定/キャンセルボタンを待つ
  }

  function onTouchCancel(e: TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    clearLongPress();
    isLongPressing = false;
  }

  function clearLongPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  /* ---- デスクトップ用 mouse handlers ---- */
  let isLocked = false;

  // ホバー中のプレビュー（未ロック時のみ追従）
  overlay.addEventListener('mousemove', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLocked) return;

    const pos = getCellAtPoint(e.clientX, e.clientY);
    if (!pos) return;

    updateHoverLayer(pos.row, pos.col);
  }, { capture: true });

  overlay.addEventListener('mouseleave', () => {
    if (!isLocked) {
      clearSelectionLayer();
    }
  }, { capture: true });

  // クリックでロック/アンロックをトグル
  overlay.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const pos = getCellAtPoint(e.clientX, e.clientY);
    if (!pos) return;

    if (isLocked) {
      // ロック解除 -> ホバープレビューに戻す
      isLocked = false;
      updateHoverLayer(pos.row, pos.col);
    } else {
      // ロック確定 -> 選択状態にする
      isLocked = true;
      updateSelectionLayer(0, 0, pos.row, pos.col);
    }
  }, { capture: true });

  /* ================================================================ */
  /* 決定 / キャンセル ボタン                                          */
  /*                                                                  */
  /* popup-body 直下に配置。オーバーレイ(z-50)より上の z-60 で確実に   */
  /* タッチ可能にする                                                   */
  /* ================================================================ */
  const existingBtns = $body.querySelector('.tk-table-btn-group');
  if (existingBtns) existingBtns.remove();

  const btnGroup = document.createElement('div');
  btnGroup.className = 'tk-table-btn-group';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'キャンセル';
  cancelBtn.type = 'button';
  cancelBtn.className = 'tk-table-cancel-btn';

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = '決定';
  confirmBtn.type = 'button';
  confirmBtn.className = 'tk-table-confirm-btn';

  btnGroup.appendChild(cancelBtn);
  btnGroup.appendChild(confirmBtn);
  $body.appendChild(btnGroup);

  /* ---- 決定ボタン: テーブル挿入 ---- */
  confirmBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasSelection) {
      const rowCount = endRow - startRow + 1;
      const colCount = endCol - startCol + 1;
      try {
        editor.exec('addTable', { rowCount, columnCount: colCount });
      } catch (err) {
        console.error('addTable exec failed:', err);
        // exec が使えない場合は、該当セルのクリックをシミュレート
        const lastCell = rows[endRow]
          ?.querySelectorAll<HTMLElement>('.toastui-editor-table-cell')[endCol];
        if (lastCell) {
          lastCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }
      }
    }
    closePopup();
  });

  /* ---- キャンセルボタン: 閉じる ---- */
  cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closePopup();
  });

  function closePopup() {
    // 独自バッジ要素を削除
    const myDescEl = $body.querySelector('.tk-table-description');
    if (myDescEl) myDescEl.remove();

    // data-tk-enhanced を外して、次回表示時に再セットアップできるようにする
    delete popup.dataset.tkEnhanced;

    // 追加した要素（オーバーレイ、ボタングループ）を削除
    // （次回セットアップ時に再作成される）
    const overlayEl = $grid.querySelector('.tk-table-overlay');
    if (overlayEl) overlayEl.remove();
    const btnGroupEl = $body.querySelector('.tk-table-btn-group');
    if (btnGroupEl) btnGroupEl.remove();

    // エディタ自身のポップアップ閉じ処理を利用する
    // ポップアップ外の領域をクリックしたかのように振る舞う
    const outsideEl = containerEl.querySelector(
      '.toastui-editor-ww-container, .toastui-editor-md-container',
    );
    if (outsideEl) {
      outsideEl.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }

    // ツールバーボタンの active 状態をリセット
    const toolbarBtns = containerEl.querySelectorAll(
      '.toastui-editor-toolbar-icons.table.active, .toastui-editor-toolbar-icons.table',
    );
    toolbarBtns.forEach((btn) => btn.classList.remove('active'));

    // 注意: popup.style.display = 'none' は行わない
    // エディタが管理するポップアップの表示状態に任せる
    // インライン style が残ると、エディタが次回表示時に
    // display:block に上書きできずポップアップが永久に非表示になる
  }
}
