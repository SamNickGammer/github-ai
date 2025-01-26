'use client'
import React from 'react'
import useProject from "@/hooks/use-project";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import Image from "next/image";
import {askQuestion} from "@/app/(protected)/dashboard/action";
import {readStreamableValue} from "ai/rsc";
import MDEditor from '@uiw/react-md-editor';
import CodeReferences from "@/app/(protected)/dashboard/code-references";
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import Spinner from '@/app/_components/spinner';
import { useTheme } from 'next-themes';

const AskQuestionCard = () => {
    const {project} = useProject()
    const [question, setQuestion] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [filesReferences, setFileReferences] = React.useState<{fileName: string, sourceCode:string, summary:string}[]>([])
    const [answer, setAnswer] = React.useState('')
    const { theme } = useTheme()

    const saveAnswer = api.project.saveAnswer.useMutation()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('')
        setFileReferences([])
        setLoading(true)
        e.preventDefault()
        if(!project?.id) return

        const {output, filesReferences} = await askQuestion(question, project?.id)
        setOpen(true)
        setFileReferences(filesReferences)

        for await (const delta of readStreamableValue((output))){
            if(delta){
                setAnswer(ans => ans + delta)
            }
        }

        setLoading(false)
    }

    return (
       <>
           <Dialog open={open} onOpenChange={setOpen}>
               <DialogContent className={'sm:max-w-[80vw]'}>
                   <DialogHeader>
                    <div className="flex items-center gap-2">
                       <DialogTitle>
                            <Image src={theme === 'dark' ? '/Scorp_Logo_Light.png' : '/Scorp_Logo_Dark.png'} alt="logo" width={40} height={40} />
                       </DialogTitle>
                       <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={() => {
                        saveAnswer.mutate({
                            projectId: project!.id,
                            question,
                            answer,
                            filesReferences
                        },{
                            onSuccess: () => {
                                toast.success('Answer saved')
                            },
                            onError: () => {
                                toast.error('Failed to save answer')
                            }
                        })
                       }}>Save Answer</Button>
                    </div>
                   </DialogHeader>
                   <div data-color-mode={theme}>
                    <MDEditor.Markdown source={answer} className={'max-w-[70vw] !h-full max-h-[30vh] overflow-auto !bg-background'} style={{fontFamily:'inherit'}}/>
                   </div>
                   <div className="h-4"></div>
                   <CodeReferences filesReferences={filesReferences}/>
                   <Button type={'button'} onClick={()=> setOpen(false)}>Close</Button>
               </DialogContent>
           </Dialog>
           <Card className={'relative col-span-3 '}>
               <CardHeader>
                   <CardTitle>Ask a Question</CardTitle>
               </CardHeader>
               <CardContent>
                   <form onSubmit={onSubmit}>
                       <Textarea placeholder={'Which file I should edit to change the Home Page'} value={question} onChange={(e) => setQuestion(e.target.value)}/>
                       <div className="h-4"></div>
                       <Button type={'submit'} disabled={loading}>
                           {loading ? <Spinner/>: "Ask GitHub!"}
                       </Button>
                   </form>
               </CardContent>
           </Card>
       </>
    )
}

export default AskQuestionCard