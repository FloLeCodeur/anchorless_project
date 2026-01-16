import React, {useEffect, useState} from 'react';
import {Upload, CheckCircle, XCircle, Send, CircleX, FileText} from 'lucide-react';
import { z } from 'zod';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

type SavedFile = {
    created_at: string;
    extension: string;
    id: number
    name: string
    path: string
    size: number
    type: string
    updated_at: string
    url: string
}

type ArticleListItem = {
    id: number
    title: string;
    description: string;
    importRules: string[];
    type: string;
    link?: string,
    linkText?: string,
}

const fileSchema = z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
        message: "Max file size is 4MB",
    })
    .refine((file) => ACCEPTED_TYPES.includes(file.type), {
        message: "Accepted types : PDF, JPG, PNG",
    });

export function FileSystemPage() {
    const [files, setFiles] = useState<Record<number, { file: File | null; error: string | null; saved: boolean }>>({});
    const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: number) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const result = fileSchema.safeParse(file);

        if (!result.success) {
            setFiles(prev => ({
                ...prev,
                [itemId]: { file: null, error: result.error.issues[0].message, saved: false },
            }));
        } else {
            setFiles(prev => ({
                ...prev,
                [itemId]: { file: result.data, error: null, saved: false },
            }));
        }

        // Reset l'input pour permettre de re-sélectionner un fichier
        e.target.value = '';
    };

    const handleSubmit = async (item: ArticleListItem) => {
        const itemId = item.id
        const fileData = files[itemId]?.file;
        if (!fileData) return;

        const formData = new FormData();
        formData.append('file', fileData);
        formData.append('type', item.type);

        try {
            const response = await fetch('http://localhost:8000/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}`);
            }

            setFiles(prev => ({
                ...prev,
                [itemId]: { file: null, error: null, saved: true },
            }));

            const data = await response.json();
            setSavedFiles(prevState => ([
                ...prevState,
                data.data
            ]))
        } catch (error) {
            setFiles(prev => ({
                ...prev,
                [itemId]: { ...prev[itemId], error: 'Error when save file' },  // Garde le fichier, ajoute juste l'erreur
            }));
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:8000/api/file/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}`);
            }

            // Retire le fichier du state
            setSavedFiles(prev => prev.filter(file => file.id !== id));
        } catch (error) {
            console.error('Erreur suppression:', error);
        }
    };

    const getAllFiles = async () => {
        const response = await fetch('http://localhost:8000/api/files')
        const data = await response.json();
        setSavedFiles(data)
    };

    useEffect(() => {
        getAllFiles();
    }, []);

    return (
        <section className='w-full bg-indigo-50 p-3 rounded-lg border border-indigo-200'>
            <h2 className='text-2xl uppercase text-indigo-600 mb-3'>Import your files</h2>
            <article>
                <ul className='list-unstyled flex flex-col lg:flex-row flex-wrap gap-3'>
                    {articleList.map((item) => (
                        <li
                            className='rounded-lg border border-indigo-200 bg-white p-2 flex-1 flex flex-col gap-2'
                            key={item.id}
                        >
                            <div>
                                <h4 className='text-1xl min-w-max text-indigo-500'>{item.title}</h4>
                                <span className='text-gray-500/50 text-sm'>{item.description}</span>
                            </div>
                            <div className='my-2 mx-1 flex items-center gap-2'>
                                <label
                                    htmlFor={`file-upload-${item.id}`}
                                    className="cursor-pointer bg-indigo-50 border border-dashed border-indigo-500 hover:bg-indigo-500 text-indigo-500 hover:text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                                >
                                    <Upload size={20} />
                                </label>
                                <input
                                    id={`file-upload-${item.id}`}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, item.id)}
                                />

                                {files[item.id]?.file && (
                                    <button
                                        onClick={() => handleSubmit(item)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
                                    >
                                        <Send size={20} />
                                        Envoyer
                                    </button>
                                )}

                            </div>

                            {files[item.id]?.error && (
                                <span className='text-sm text-red-500 flex items-center gap-1'>
                                    <XCircle size={16} />
                                    {files[item.id].error}
                                </span>
                            )}
                            {files[item.id]?.file && (
                                <span className='text-sm text-green-500 flex items-center gap-1'>
                                    <CheckCircle size={16} />
                                    {files[item.id].file?.name}
                                </span>
                            )}

                            <span className='text-sm text-gray-500/50'>{item.importRules.join(', ')}</span>

                            <div className='flex flex-wrap gap-1'>
                                {savedFiles
                                    .filter((el) => el.type === item.type)
                                    .map((el) => (
                                        <div key={el.id} className="relative" title={el.name}>
                                            {el.extension.includes('pdf') ? (
                                                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                                                    <FileText className="w-10 h-10 text-red-500" />
                                                </div>
                                            ) : (
                                                <img src={el.url} alt={el.name} className="w-20 h-20 object-cover rounded" />
                                            )}
                                            <button
                                                onClick={() => handleDelete(el.id)}
                                                className="absolute top-1 right-1 bg-white rounded-full p-1 hover:bg-red-100 transition-colors"
                                            >
                                                <CircleX className="text-red-500 w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                }
                            </div>
                        </li>
                    ))}
                </ul>
            </article>
        </section>
    );
}

const importRules = ['PDF', 'JPG', 'PNG', '(max. 4MB)'];

const articleList: ArticleListItem[] = [
    {
        id: 1,
        title: 'Import your file',
        description: 'Import your VISA file',
        importRules: importRules,
        type: 'VISA'
    },
    {
        id: 2,
        title: 'Import your photos',
        description: 'Passport type, recent, and in good condition, to identify the applicant.',
        link: '#',
        linkText: 'Learn more about the requirements here',
        importRules: importRules,
        type: 'PHOTOS',
    },
    {
        id: 3,
        title: 'Passport',
        description: 'Valid for a least 6 months when submitting your visa application',
        link: '#',
        linkText: 'Learn more about the requirements here',
        importRules: importRules,
        type: 'PASSPORT',
    }
];