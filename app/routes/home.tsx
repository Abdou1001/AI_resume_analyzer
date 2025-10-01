import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
// import { resumes } from "../../constants/index";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/Puter";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {

  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false)


  useEffect(() => {

    if (!auth.isAuthenticated) navigate("/auth?next=/");

  }, [auth.isAuthenticated])

  useEffect(() => {
    const loadResume = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list("resume:*", true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ))

      console.log("parsedREsumes", parsedResumes);

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }

    loadResume()
  }, [])



  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">

      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes?.length === 0 ?
            (
              <h2>No Resume found. Upload your first resume to get feedback.</h2>
            ) : (
              <h2>Review your submissions and check AI-powered feedback.</h2>
            )
          }
        </div>

          {loadingResumes && (
            <div className="flex flex-col items-center justify-center">
              <img src="/public/images/resume-scan-2.gif" alt="scan" className="w-[200px]"/>
            </div> 
          )}

        {!loadingResumes && resumes.length > 0 && (
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

        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Reusme
            </Link>
          </div>
        )}

      </section>



    </main>
  );
}
