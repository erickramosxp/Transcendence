import React, { useState } from "react";
import { Avatar } from "./Avatar";
import { CoverPhoto } from "./CoverPhoto";
import { ProfileInfo } from "./ProfileInfo";
import { yaleBlue } from "../../../components/utils/colors";
import { Button } from "../../../components/ui/Button";
import { SquarePen, Settings } from 'lucide-react';
import { Modal } from "../../../components/Modal";
import { EditProfileForm } from "./EditProfileForm";
import { ThemeToggle } from "../../../components/ThemeToggle";

const userData = {
name: "Morty",
username: "morty",
bio: "Apaixonado por tecnologia e inovação 💻",

location: "São Paulo, Brasil",
website: "example.com",
joinDate: "Janeiro 2024",

followers: "1.2k",
following: "256",
// Teste colocar uma URL de imagem aqui depois, ex: "https://images.unsplash.com/photo-1504805572947-34fad45aed93"
coverUrl: "https://images.unsplash.com/photo-1504805572947-34fad45aed93",
// "https://github.com/shadcn.png"
avatarUrl: "https://github.com/shadcn.png",
};

export const ProfileHeader = () => {
  
	const [editOpen, setEditOpen] = useState(false);

  return (
	<>
		<Modal 
			open={editOpen}
			title="Editar Perfil"
			onClose={() => setEditOpen(false)}
		>
			<EditProfileForm 
				onCancel={() => setEditOpen(false)}
				onSaved={() => setEditOpen(false)}
			/>
		</Modal>
  	<div className={`${yaleBlue.bg.lightest} pb-5`}>
		<div className="w-full max-w-4xl mx-auto">
			<CoverPhoto className='overflow-hidden'
				coverUrl={userData.coverUrl}
			/>

			<div className="px-4 pb-4 bg-white shadow-md">

				<div className="flex justify-between items-start relative">

					<div className="-mt-16 rounded-full bg-white p-1 relative z-10"> 

						<Avatar
							size="xl"
							name={userData.name}
							imgUrl={
							userData.avatarUrl
							}
						/>

					</div>

					<div className="flex justify-center items-center gap-2.5">
						<Button variant={"yaleGradient"} size={"lg"} className="mt-4 rounded-full" onClick={() => setEditOpen(true)}>
							<SquarePen />
							Editar Perfil
						</Button>
						<Button className='mt-4 bg-white border-2'>
							<Settings color="#0d0d0d"/>
						</Button>
						<div className="mt-4">
							<ThemeToggle />
						</div>
					</div>
				</div>
			<ProfileInfo  
				{...userData}
				/>
			</div>
		</div>
    </div>
	</>
  );
};
