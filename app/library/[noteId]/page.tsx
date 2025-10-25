'use client';
import { use } from "react";
import LibraryDetail from '../LibraryDetail';

interface PageProps {
  params: Promise<{ noteId: string }>;
}

export default function NoteDetailPage({ params }: PageProps) {
  const { noteId } = use(params);
  const noteIdNum = Number(noteId);
  if (isNaN(noteIdNum)) return <div>잘못된 접근입니다.</div>;
  return <LibraryDetail noteId={noteIdNum} />;
}