import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import { resumes } from "../../constants/index";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/Puter";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  
  const { auth } = usePuterStore();
  const navigate = useNavigate()


  useEffect(() => {

    if (! auth.isAuthenticated) navigate("/auth?next=/");

  }, [auth.isAuthenticated])
  
  
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">

      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          <h2>Review your submissions and check AI-powered feedback.</h2>
        </div>


        {resumes.length > 0 && (
          <div className="resumes-section">
            {
              resumes.map(resume => (
                <h1>
                  <ResumeCard key={resume.id} resume={resume} />
                </h1>
              ))
            }
          </div>
        )}


      </section>



    </main>
  );
}
