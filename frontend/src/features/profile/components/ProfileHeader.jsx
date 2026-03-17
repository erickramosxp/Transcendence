import React, { useState } from "react";
import { SquarePen, Settings } from 'lucide-react';

import { Avatar } from "./Avatar";
import { CoverPhoto } from "./CoverPhoto";
import { ProfileInfo } from "./ProfileInfo";
import { EditProfileForm } from "./EditProfileForm";
import { Button } from "@/design-system/primitives/Button";
import { Modal } from "@/design-system/components/Modal";

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
  	<div className={`pb-5`}>
		<div className="w-full max-w-4xl mx-auto">
			<CoverPhoto className='overflow-hidden'
				coverUrl={userData.coverUrl}
			/>

			<div className="px-4 pb-4 bg-card border-b border-border shadow-md rounded-b-md">

				<div className="flex justify-between items-start relative">

					<div className="-mt-16 rounded-full p-1 relative z-10 border-background bg-background"> 

						<Avatar
							size="xl"
							name={userData.name}
							imgUrl={
							userData.avatarUrl
							}
						/>

					</div>

					<div className="flex justify-center items-center gap-2.5">
						<Button variant='outline' className="mt-4 rounded-full cursor-pointer" onClick={() => setEditOpen(true)}>
							<SquarePen />
							Editar Perfil
						</Button>
						<Button variant='outline' className='mt-4 rounded-full cursor-pointer'>
							<Settings />
						</Button>
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
