// app/profile/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function IndividualProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch(`/api/individual/${id}`);
        const data = await res.json();
        setProfile(data.data);
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProfile();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex flex-col items-center gap-4">
        <img
          src={profile.profileImage || "/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover"
        />
        <h1 className="text-2xl font-bold">{profile.user?.name}</h1>
        <div className="text-gray-600">{profile.position}</div>
        <div className="text-gray-500">Company: {profile.company}</div>
        <div className="text-gray-500">Country: {profile.country}</div>
        <div className="mt-4 text-center">{profile.bio}</div>
        <div className="mt-6 w-full">
          <h2 className="text-lg font-semibold mb-2">Experiences</h2>
          <ul className="space-y-2">
            {profile.experiences?.map((exp) => (
              <li key={exp.id} className="border-b pb-2">
                <div className="font-medium">{exp.role} at {exp.company}</div>
                <div className="text-sm text-gray-500">{exp.startDate} - {exp.endDate || "Present"}</div>
                <div className="text-sm">{exp.description}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 flex gap-4">
          {profile.linkedinUrl && (
            <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
              LinkedIn
            </a>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}