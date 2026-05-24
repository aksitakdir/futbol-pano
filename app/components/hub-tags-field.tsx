"use client";

/**
 * @deprecated Hub tags are no longer used. Articles are categorized
 * directly via the category field. This stub exists only to prevent
 * build errors from any remaining imports.
 */

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
};

export default function HubTagsField({ value: _value, onChange: _onChange }: Props) {
  return null;
}
