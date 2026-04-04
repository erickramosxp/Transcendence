import React from "react";
import { useTranslation } from "react-i18next";

import { Separator, Modal } from "@/design-system";

function Popup({ open, onClose, children }) {


	const { t } = useTranslation('feed');

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={t('popup.title')}
			size="md"
			scrollable={false}
			scrollMode="none"
		>
			<p className="mt-1 text-sm text-muted-foreground">
				{t('popup.description')}
			</p>

			<div className="my-5 sm:my-6">
				<Separator />
			</div>

			{children}
		</Modal>
	);
}

export default Popup;