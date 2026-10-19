import { mockAppRoot } from '@rocket.chat/mock-providers';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TwoFactorEmailModal from './TwoFactorEmailModal';

it.each([
	['error-challenge-expired', 'Login expired'],
	['error-challenge-not-found', 'Login expired'],
	['error-email-code-cooldown', 'Wait for the next code'],
])('explains why resending failed when the server answers %s', async (errorType, message) => {
	const dispatch = jest.fn();
	const wrapper = mockAppRoot()
		.withTranslations('en', 'core', {
			'Two-factor_authentication_expired': 'Login expired',
			'Two-factor_email_code_cooldown': 'Wait for the next code',
			'Cloud_resend_email': 'Resend email',
		})
		.withEndpoint('POST', '/v1/twoFactorChallenges.sendEmailCode', () => {
			throw Object.assign(new Error(errorType), { errorType });
		})
		.withToastMessageDispatch(dispatch)
		.build();

	render(<TwoFactorEmailModal challengeId='challenge-1' onConfirm={jest.fn()} onClose={jest.fn()} />, { wrapper });

	await userEvent.click(screen.getByRole('button', { name: 'Resend email' }));

	await waitFor(() => expect(dispatch).toHaveBeenCalledWith({ type: 'error', message }));
});
