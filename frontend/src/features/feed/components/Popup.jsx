import React from "react";
import { Separator } from "@/design-system/primitives/Separator"
import { useTranslation } from "react-i18next";

import { Separator, Modal } from "@/design-system";

function Popup({ open, onClose, children }) {


	const { t } = useTranslation();

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Criar publicação"
			size="md"
			scrollable={false}
			scrollMode="none"
		>
			<p className="mt-1 text-sm text-muted-foreground">
				Compartilhe algo com sua comunidade
			</p>

			<div className="my-5 sm:my-6">
				<Separator />
			</div>

			{children}
		</Modal>
	);
}

export default Popup;