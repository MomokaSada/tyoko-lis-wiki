import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: '利用規約 | Tyokore Wiki',
  description: 'Tyokore Wiki の利用規約です。サービス利用時のルール・条件を掲載しています。',
};

export default function TermsPage() {
  const lastUpdateDate = '2026年4月13日';
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black text-stone-800 mb-8">利用規約</h1>

      <div className="prose prose-stone max-w-none">
        <p className="text-stone-600 mb-6">
          この利用規約（以下、「本規約」といいます。）は、ちょこちょこ大百科（以下、「当サイト」といいます。）の利用条件を定めるものです。
          登録ユーザーの皆さま（以下、「ユーザー」といいます。）には、本規約に従って、当サイトをご利用いただきます。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第1条（適用）</h2>
        <p className="text-stone-600 mb-6">
          本規約は、ユーザーと当サイト運営者との間の当サイトの利用に関わる一切の関係に適用されるものとします。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第2条（利用登録）</h2>
        <p className="text-stone-600 mb-6">
          当サイトにおいては、登録希望者が本規約に同意の上、当サイトの定める方法によって利用登録を申請し、
          当サイトがこれを承認することによって、利用登録が完了するものとします。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第3条（ユーザーIDおよびパスワードの管理）</h2>
        <p className="text-stone-600 mb-6">
          ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第4条（利用料金および支払方法）</h2>
        <p className="text-stone-600 mb-6">
          ユーザーは、本サービスの有料部分の対価として、当サイトが別途定め、本ウェブサイトに表示する利用料金を、
          当サイトが指定する方法により支払うものとします。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第5条（禁止事項）</h2>
        <p className="text-stone-600 mb-6">
          ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
        </p>
        <ul className="list-disc list-inside text-stone-600 mb-6 ml-4">
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>当サイトのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
          <li>当サイトのサービスの運営を妨害するおそれのある行為</li>
          <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
          <li>他のユーザーに成りすます行為</li>
          <li>当サイトのサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
        </ul>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第6条（本サービスの提供の停止等）</h2>
        <p className="text-stone-600 mb-6">
          当サイトは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第7条（著作権）</h2>
        <p className="text-stone-600 mb-6">
          ユーザーは、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た文章、画像や映像等の情報に関してのみ、本サービスを利用し、投稿ないしアップロードすることができるものとします。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第8条（利用制限および登録抹消）</h2>
        <p className="text-stone-600 mb-6">
          当サイトは、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、投稿データを削除し、ユーザーに対して本サービスの全部もしくは一部の利用を制限しまたはユーザーとしての登録を抹消することができるものとします。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第9条（保証の否認および免責事項）</h2>
        <p className="text-stone-600 mb-6">
          当サイトは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第10条（サービス内容の変更等）</h2>
        <p className="text-stone-600 mb-6">
          当サイトは、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第11条（利用規約の変更）</h2>
        <p className="text-stone-600 mb-6">
          当サイトは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第12条（個人情報の取扱い）</h2>
        <p className="text-stone-600 mb-6">
          当サイトは、本サービスの利用によって取得する個人情報については、当サイト「プライバシーポリシー」に従い適切に取り扱うものとします。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第13条（通知または連絡）</h2>
        <p className="text-stone-600 mb-6">
          ユーザーと当サイトとの間の通知または連絡は、当サイトの定める方法によって行うものとします。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第14条（権利義務の譲渡の禁止）</h2>
        <p className="text-stone-600 mb-6">
          ユーザーは、当サイトの書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
        </p>

        <h2 className="text-xl font-bold text-stone-800 mt-8 mb-4">第15条（準拠法・裁判管轄）</h2>
        <p className="text-stone-600 mb-6">
          本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当サイトの本店所在地を管轄する裁判所を専属的合意管轄とします。
        </p>

        <p className="text-stone-500 text-sm mt-8">
          最終更新日: {lastUpdateDate}
        </p>
      </div>
    </div>
  );
}