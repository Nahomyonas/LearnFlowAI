"use client";

import { useEffect, useState } from "react";

type Brief = {
  id: string;
  topic: string | null;
  source: "manual" | "bot";
  mode_state: "collecting" | "ready_for_outline" | "outline_ready" | "outcomes_ready" | "committed" | "abandoned";
  created_at: string;
  updated_at: string;
};

type Course = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  visibility: "private" | "unlisted" | "public";
  updated_at: string;
};

export default function DashboardClient() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [newBriefTopic, setNewBriefTopic] = useState("");
  const [newBriefSource, setNewBriefSource] = useState<"manual" | "bot">("manual");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        fetch("/api/course-briefs?limit=20", { cache: "no-store" }),
        fetch("/api/courses?limit=20", { cache: "no-store" }),
      ]);
      const bJson = await bRes.json();
      const cJson = await cRes.json();
      setBriefs(bJson.items ?? []);
      setCourses(cJson.items ?? []);
    } catch (e: any) {
      setMessage(`Load failed: ${e?.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createBrief() {
    setMessage(null);
    try {
      const res = await fetch("/api/course-briefs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: newBriefSource, topic: newBriefTopic }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error?.message || "Failed to create brief");
      }
      setNewBriefTopic("");
      await load();
      setMessage("Brief created ✅");
    } catch (e: any) {
      setMessage(e.message || "Error creating brief");
    }
  }

  async function createCourse() {
    setMessage(null);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: newCourseTitle }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error?.message || "Failed to create course");
      }
      setNewCourseTitle("");
      await load();
      setMessage("Course created ✅");
    } catch (e: any) {
      setMessage(e.message || "Error creating course");
    }
  }

  async function commitBrief(id: string) {
    setMessage(null);
    try {
      const res = await fetch(`/api/course-briefs/${id}/commit`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error?.message || "Commit failed");
      }
      await load();
      setMessage("Committed brief → course ✅");
    } catch (e: any) {
      setMessage(e.message || "Commit error");
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">LearnFlow — Dashboard</h1>
        <button
          onClick={load}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Refresh
        </button>
      </header>

      {message && (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          {message}
        </div>
      )}

      {/* Create Brief */}
      <section className="rounded-2xl border p-4">
        <h2 className="mb-3 text-lg font-medium">New Brief</h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <select
            className="w-full rounded-md border px-3 py-2 md:w-40"
            value={newBriefSource}
            onChange={(e) => setNewBriefSource(e.target.value as "manual" | "bot")}
          >
            <option value="manual">manual</option>
            <option value="bot">bot</option>
          </select>
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Topic (e.g., Intro to React)"
            value={newBriefTopic}
            onChange={(e) => setNewBriefTopic(e.target.value)}
          />
          <button
            onClick={createBrief}
            className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90"
            disabled={!newBriefTopic.trim()}
          >
            Create Brief
          </button>
        </div>
      </section>

      {/* Create Course (manual) */}
      <section className="rounded-2xl border p-4">
        <h2 className="mb-3 text-lg font-medium">New Course (Manual)</h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="Title (e.g., React for Beginners)"
            value={newCourseTitle}
            onChange={(e) => setNewCourseTitle(e.target.value)}
          />
          <button
            onClick={createCourse}
            className="rounded-md bg-black px-4 py-2 text-white hover:opacity-90"
            disabled={!newCourseTitle.trim()}
          >
            Create Course
          </button>
        </div>
      </section>

      {/* Briefs List */}
      <section className="rounded-2xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Your Briefs</h2>
          <span className="text-sm text-gray-500">{briefs.length} items</span>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : briefs.length === 0 ? (
          <div className="text-sm text-gray-500">No briefs yet.</div>
        ) : (
          <ul className="grid gap-3">
            {briefs.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{b.topic || "(untitled brief)"}</div>
                  <div className="text-xs text-gray-500">
                    {b.source} · {b.mode_state} · updated {new Date(b.updated_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => commitBrief(b.id)}
                    disabled={b.mode_state === "committed"}
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-40"
                  >
                    Commit → Course
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Courses List */}
      <section className="rounded-2xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Your Courses</h2>
          <span className="text-sm text-gray-500">{courses.length} items</span>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : courses.length === 0 ? (
          <div className="text-sm text-gray-500">No courses yet.</div>
        ) : (
          <ul className="grid gap-3">
            {courses.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-gray-500">
                    {c.status} · {c.visibility} · updated {new Date(c.updated_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-gray-500">/{c.slug}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}