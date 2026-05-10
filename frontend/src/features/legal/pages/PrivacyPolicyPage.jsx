import React from 'react'
import { LegalLayout } from '../components/LegalLayout'
import { usePrivacySections } from '../hooks/usePrivacySections';
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger, Header, Separator } from '@/design-system';
import { LegalPageHeader } from '../components/LegalPageHeader';
import { Shield } from 'lucide-react';
import { LegalSection } from '../components/LegalSection';
import { LegalNavigation } from '../components/LegalNavigation';
export function PrivacyPolicyPage() {

    const sections = usePrivacySections();

    return (
        <div className='p-2'>
            <Header />
            <Separator />
            <LegalLayout>
                <LegalPageHeader
                    title="Política de Privacidade"
                    description="Última atualização: 08 de maio de 2026"
                    icon={<Shield className='text-primary' size={28} />}
                />
                <LegalNavigation />
                <div>
                    <p>
                        Esta Política de Privacidade descreve como o Videa coleta,
                        utiliza e armazena informações relacionadas aos usuários
                        da plataforma.
                    </p>
                </div>
                <LegalSection>

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

