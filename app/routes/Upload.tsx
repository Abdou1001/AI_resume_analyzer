import { prepareInstructions } from '../../constants';
import React, { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router';
import Navbar from '~/components/Navbar'
import Uploader from '~/components/Uploader';
import { convertPdfToImage } from '~/lib/pdf2img';
import { usePuterStore } from '~/lib/Puter';
import { generateUUID } from '~/lib/utils';

const Upload = () => {

    const { auth, fs, ai, kv, isLoading } = usePuterStore();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [statusText, setStatusText] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);


    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }

    const hanldeAnalyze = async ({ companyName, jobTitle, jobDescription, file }:
        { companyName: string, jobTitle: string, jobDescription: string, file: File }) => {

        setIsProcessing(p => p = true);
        setStatusText("Uploading the file...");

        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) return setStatusText("Error: Failed to upload file");

        setStatusText("Converting to image...");

        const imageFile = await convertPdfToImage(file);
        
        if (!imageFile.file) return setStatusText("Error: Failed to convert to image");

        setStatusText("Uploading the image...");

        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedFile) return setStatusText("Error: Failed to upload Image");

        setStatusText("Preparing data...");

        const uuid = generateUUID();

        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage?.path,
            companyName, jobTitle, jobDescription,
            feedback: "",
        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText("Analyzing...");

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
        )

        if (!feedback) return setStatusText("Error: Failed to analyze resume");

        const feedbackText = typeof feedback.message.content === "string"
            ? feedback.message.content
            : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText("Analyzing complete, redirecting");

        console.log(data);
        navigate(`/resume/${uuid}`)


    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget.closest("form");

        if (!form) return

        const formData = new FormData(form);

        const companyName = formData.get("company-name") as string;
        const jobTitle = formData.get("job-title") as string;
        const jobDescription = formData.get("job-description") as string;


        if (!file) return;
        hanldeAnalyze({ companyName, jobTitle, jobDescription, file })
    }


    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">

            {/* Navbar */}
            <Navbar />

            {/* Header */}
            <section className="main-section">
                <div className="page-heading py-16 gap-2">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2 className='my-3'>{statusText}</h2>
                            <img src="/public/images/resume-scan.gif" alt="scan" className='w-[400px]' />
                        </>
                    ) : <h2>Drop your resume for an ATS score and improvement tips.</h2>}

                    {!isProcessing && (
                        <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-10'>
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" id='company-name' name='company-name' placeholder='Company Name' />
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" id='job-title' name='job-title' placeholder='Job Title' />
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} className='w-full' id='job-description' name='job-description' placeholder='Job Description' />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <Uploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className='primary-button' type='submit'>Analyze Resume</button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Upload
