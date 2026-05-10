import React from 'react'
import { LegalLayout } from '../components/LegalLayout'
import { usePrivacySections } from '../hooks/usePrivacySections';
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger, Header, Separator, TopBar } from '@/design-system';
import { LegalPageHeader } from '../components/LegalPageHeader';
import { Shield } from 'lucide-react';
import { LegalSection } from '../components/LegalSection';
import { LegalNavigation } from '../components/LegalNavigation';
import { useTranslation } from 'react-i18next';
export function PrivacyPolicyPage() {

    const { t } = useTranslation('privacyPolicy');
    const sections = usePrivacySections();

    return (
        <div className='p-2 relative'>
            <TopBar />
            <Header />
            <Separator />
            <LegalLayout>
                <LegalPageHeader
                    title={t('pageTitle')}
                    description={t('lastUpdated')}
                    icon={<Shield className='text-primary' size={28} />}
                />
                <LegalNavigation />
                <div>
                    <p>
                        {t('intro')}
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

