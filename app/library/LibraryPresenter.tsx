'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LibraryPresenter() {
  const [notes, setNotes] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:3000/api/notes", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        const notesArr = Array.isArray(data?.data?.notes)
          ? data.data.notes
          : [];
        setNotes(notesArr);
      });
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-lg font-bold mb-4">내 자료</h2>
      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.note_id || note.id}>
            <button
              className="w-full text-left p-3 rounded bg-gray-100 hover:bg-yellow-100"
              onClick={() => router.push(`/library/${note.note_id || note.id}`)}
            >
              {note.title || note.name}
            </button>
          </li>
        ))}
        {notes.length === 0 && (
          <li className="text-gray-500 text-center py-4">
            노트가 없습니다.
          </li>
        )}
      </ul>
    </main>
  );
}
