'use client';

import { CreatePostForm } from './create-post-form';

export function CreatePostFormClient({
  sessionToken,
  availableTagsJson,
  availableCategoriesJson,
}: {
  sessionToken: string | null;
  availableTagsJson: string;
  availableCategoriesJson: string;
}) {
  return (
    <CreatePostForm
      sessionToken={sessionToken}
      availableTagsJson={availableTagsJson}
      availableCategoriesJson={availableCategoriesJson}
    />
  );
}
