import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import ATS from '~/components/ATS';
import Details from '~/components/Details';
import Summary from '~/components/Summary';
import { usePuterStore } from '~/lib/Puter';

export const meta = () => ([
    { title: "Resumind | Review" },
    { name: "description", content: "Log into your account" }
])

const Resume = () => {
    const { auth, isLoading, kv, fs } = usePuterStore()
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState("");
    const [ResumeUrl, setResumeUrl] = useState("");
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    useEffect(() => {

        if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);

    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if (!resume) return;
            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);

            if (!resumeBlob) return;
            const pdfBlog = new Blob([resumeBlob], { type: "application/pdf" });
            const ResumeUrl = URL.createObjectURL(pdfBlog);
            setResumeUrl(ResumeUrl);

            const imageBlog = await fs.read(data.imagePath);

            if (!imageBlog) return
            const imageUrl = URL.createObjectURL(imageBlog);
            setImageUrl(imageUrl)

            setFeedback(data.feedback);

        }

        loadResume();

    }, [id])


    return (
        <main className='!pt-0'>
            <nav className='resume-nav'>
                <Link to="/" className='back-buuton'>
                    <img src="/public/icons/back.svg" alt="back icon" />
                    <span className='text-gray-800 text-sm font-semibold'>Back to home page</span>
                </Link>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && ResumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-w-xl:h-fit w-fit">
                            <a href={ResumeUrl} target='_blank'>
                                <img src={imageUrl} alt="resume" title='resume' className='w-full h-full object-contain rounded-2xl' />
                            </a>
                        </div>
                    )}
                </section>

                <section className="feedback-section">
                    <h2 className='text-4xl !text-black font-bold'>Resume Review</h2>
                    {feedback ? (
                        <div className='flex flex-col gap-8 animate-in fade-in duration-1000'>
                            <Summary feedback={feedback}/>
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []}/>
                            <Details feedback={feedback} />
                        </div>
                    ) :
                        (
                            <img src="/public/images/resume-scan-2.gif" alt="scan" className='w-full' />
                        )
                    }
                </section>
            </div>
        </main>
    )
}

export default Resume
