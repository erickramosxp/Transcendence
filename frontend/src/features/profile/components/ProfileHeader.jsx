import React from "react";
import { Avatar } from "./Avatar";
import { CoverPhoto } from "./CoverPhoto";
import { ProfileInfo } from "./ProfileInfo";
import { yaleBlue } from "../../../components/utils/colors";
import { Button } from "../../../components/ui/Button";
import { SquarePen } from 'lucide-react';

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
  

  return (
  	<div className={`min-h-screen ${yaleBlue.bg.lightest} pb-10`}>
		<div className="w-full max-w-4xl mx-auto bg-white shadow-md overflow-hidden">
			<CoverPhoto 
				coverUrl={userData.coverUrl}
			/>

			<div className="px-4 pb-4">

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

					<Button variant={"yaleGradient"} size={"lg"} className="mt-4 rounded-full">
						<SquarePen />
						Editar Perfil
					</Button>
				</div>
			<ProfileInfo  
				{...userData}
				/>
			</div>
		</div>
    </div>
  );
};
