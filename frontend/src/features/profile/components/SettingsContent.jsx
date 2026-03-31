import React from 'react'
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@/design-system/primitives/Tabs'
import { Input } from '@/design-system/primitives/Input'
import { Label } from '@/design-system/primitives/Label'
import { Button } from '@/design-system/primitives/Button'
import { LanguageSwitcher } from '@/design-system/components/LanguageSwitcher'
import { ThemeToggle } from '@/design-system/components/ThemeToggle'
import { useAuth } from '@/app/providers/AuthProvider'

export const SettingsContent = () => {

    const { logout } = useAuth();

    const handleSettingsSubmit = (e) => {

        e.preventDefault();
        alert("Not implemented yet");
    }

    return (
        <>
        <Tabs defaultValue="account" >
            <TabsList className="rounded-none">
                <TabsTrigger value="account">Conta</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
                <TabsTrigger value="appearance">Aparência</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
                <div className='p-4'>
                    <Button variant="destructive" onClick={logout}>Logout</Button>
                </div>
            </TabsContent>
            <TabsContent value="security">
                <div className='p-4 text-center'>
                    <h2>Alterar senha</h2>
                    <form onSubmit={handleSettingsSubmit}>

                        <div>
                            <Label htmlFor="">Senha Atual</Label>
                            <Input type="text" />
                        </div>
                        <div>
                            <Label htmlFor="">Nova Senha</Label>
                            <Input type="text" />
                        </div>
                        <div>
                            <Label htmlFor="">Confirmar Senha</Label>
                            <Input type="text" />
                        </div>
                        <Button type='submit'>Alterar</Button>
                    </form>
                </div>
            </TabsContent>
            <TabsContent value="appearance" className="overflow-visible">
                <div className='p-4'>
                    <Label>Tema</Label>
                    <ThemeToggle />
                    <Label>Idioma</Label>
                    <LanguageSwitcher />
                </div>
            </TabsContent>
        </Tabs>
            
        </>
    )
}
