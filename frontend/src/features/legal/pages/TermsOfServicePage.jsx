import React from 'react'
import { LegalLayout } from '../components/LegalLayout'
import { Header, Separator, TopBar } from '@/design-system'

import {
    ShieldCheck,
} from 'lucide-react'

import { LegalSection } from '../components/LegalSection'

import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from '@/design-system'
import { LegalPageHeader } from '../components/LegalPageHeader'
import { useTermsSections } from '../hooks/useTermsSections'
import { LegalNavigation } from '../components/LegalNavigation'
import { useTranslation } from 'react-i18next'

export function TermsOfServicePage() {

    const { t } = useTranslation('termsOfService');
    const sections = useTermsSections();

    return (
        <div className='p-2 relative'>
            <TopBar />
            <Header />
            <Separator />
            <LegalLayout>
                <LegalPageHeader
                    title={t('pageTitle')}
                    description={t('lastUpdated')}
                    icon={<ShieldCheck className='text-primary' size={28} />}
                />
                <LegalNavigation />
                <div>
                    <p>
                        {t('intro')}
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
