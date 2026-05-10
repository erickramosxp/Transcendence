import React from 'react'
import { LegalLayout } from '../components/LegalLayout'
import { Header, Separator } from '@/design-system'

import {
    ShieldCheck,
} from 'lucide-react'

import { LegalSection } from '../components/LegalSection'

import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from '@/design-system'
import { LegalPageHeader } from '../components/LegalPageHeader'
import { useTermsSections } from '../hooks/useTermsSections'
import { LegalNavigation } from '../components/LegalNavigation'

export function TermsOfServicePage() {

    const sections = useTermsSections();

    return (
        <div className='p-2'>
            <Header />
            <Separator />
            <LegalLayout>
                <LegalPageHeader
                    title="Termos de Serviço"
                    description="Última atualização: 08 de maio de 2026"
                    icon={<ShieldCheck className='text-primary' size={28} />}
                />
                <LegalNavigation />
                <div>
                    <p>
                        Ao criar uma conta ou utilizar o Videa, você concorda com estes Termos de Serviço.
                        Caso não concorde com algum dos termos, não utilize a plataforma.
                    </p>
                </div>
                <LegalSection className={'mt-5'} >

                    <Accordion
                        type="single"
                        defaultValue={sections[0].value}
                        collapsible
                    >
                        {sections.map((section) => (
                            <AccordionItem key={section.value} value={section.value}>
                                <AccordionHeader>
                                    <AccordionTrigger icon={section.icon}>{section.title}</AccordionTrigger>
                                </AccordionHeader>
                                <AccordionContent>{section.content}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </LegalSection>
            </LegalLayout>
        </div>
    )
}
