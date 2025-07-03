"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Edit, Trash2, Link2, Users } from "lucide-react";

type ShareableLink = {
  slug: string;
  videoUrl?: string | null;
  type: "ONE_TO_ONE" | "GENERAL";
};

type Event = {
  id: string;
  title: string;
  description: string;
  type: string; // backend sends "VIRTUAL"
  estimatedDuration?: number;
  shareableLinks: ShareableLink[];
  // ...other fields
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
   const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/individual-event");
        const data = await res.json();
        setEvents(data.data || []);
      } catch (err) {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Use shareableLinks[0].type to split events
  const oneToOneEvents = events.filter(
    (e) => e.shareableLinks[0]?.type === "ONE_TO_ONE"
  );
  const generalEvents = events.filter(
    (e) => e.shareableLinks[0]?.type === "GENERAL"
  );

  const handleCopyOneToOne = (videoUrl?: string | null) => {
    if (!videoUrl) return;
    navigator.clipboard.writeText(videoUrl);
    setCopied(videoUrl);
    setTimeout(() => setCopied(null), 1200);
  };

  const handleCopyGeneral = (slug: string) => {
    const origin = process.env.NEXT_PUBLIC_ORIGIN || window.location.origin;
    const fullUrl = `${origin}/event/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(slug);
    setTimeout(() => setCopied(null), 1200);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`/api/individual-event/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
      setEvents(events => events.filter(event => event.id !== id));
    } catch (err) {
      setError("Failed to delete event");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/event/edit/${id}`);
  };

  return (
    <div className="p-4 space-y-8">
      {/* One-to-One Meetings */}
      <section>
        <h2 className="text-xl font-bold mb-4">One-to-One Meetings</h2>
        {oneToOneEvents.length === 0 && <p className="text-muted-foreground">No one-to-one meetings found.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {oneToOneEvents.map(event => {
            const link = event.shareableLinks[0];
            return (
              <Card key={event.id}>
                <CardHeader className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">One-to-One</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event.id)}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label="Edit"
                    >
                      <Edit size={18} className="text-gray-500 hover:text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label="Delete"
                    >
                      <Trash2 size={18} className="text-gray-500 hover:text-red-600" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{event.description}</p>
                  <div className="mt-2">
                    <strong>Duration:</strong>{" "}
                    {event.estimatedDuration ? `${event.estimatedDuration} min` : "N/A"}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 items-start">
                  <button
                    onClick={() => handleCopyOneToOne(link?.videoUrl)}
                    disabled={!link?.videoUrl}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs flex items-center gap-1 disabled:opacity-50"
                  >
                    <Link2 size={14} />
                    {copied === link?.videoUrl ? "Copied!" : "Copy meeting link"}
                  </button>
                  {link?.videoUrl && (
                    <span className="text-xs text-muted-foreground break-all">{link.videoUrl}</span>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* General Meetings */}
      <section>
        <h2 className="text-xl font-bold mb-4">General Meetings</h2>
        {generalEvents.length === 0 && <p className="text-muted-foreground">No general meetings found.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generalEvents.map(event => {
            const link = event.shareableLinks[0];
            return (
              <Card key={event.id}>
                <CardHeader className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">General</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {/* Participants Icon */}
                    <button
                      onClick={() => {
                        setActiveEventId(event.id);
                        setShowParticipantsModal(true);
                      }}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label="View Participants"
                    >
                      <Users size={18} className="text-gray-500 hover:text-green-600" />
                    </button>
                    <button
                      onClick={() => handleEdit(event.id)}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label="Edit"
                    >
                      <Edit size={18} className="text-gray-500 hover:text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label="Delete"
                    >
                      <Trash2 size={18} className="text-gray-500 hover:text-red-600" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{event.description}</p>
                  <div className="mt-2">
                    <strong>Duration:</strong>{" "}
                    {event.estimatedDuration ? `${event.estimatedDuration} min` : "N/A"}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 items-start">
                  <button
                    onClick={() => handleCopyGeneral(link?.slug || "")}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs flex items-center gap-1"
                  >
                    <Link2 size={14} />
                    {copied === link?.slug ? "Copied!" : "Copy booking link"}
                  </button>
                  {link?.slug && (
                    <span className="text-xs text-muted-foreground break-all">
                      {process.env.NEXT_PUBLIC_ORIGIN || window.location.origin}/event/{link.slug}
                    </span>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
        {/* Participants Modal */}
        {showParticipantsModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]">
              <h3 className="text-lg font-bold mb-2">Participants</h3>
              <ul className="mb-4">
                <li className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  <span>alice@example.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  <span>bob@example.com</span>
                </li>
              </ul>
              <button
                className="w-full bg-blue-600 text-white py-2 rounded mb-2 hover:bg-blue-700"
                onClick={() => alert('Event confirmed!')}
              >
                Confirm Event
              </button>
              <button
                className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                onClick={() => setShowParticipantsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
