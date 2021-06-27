import { render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { getSession } from 'next-auth/client';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicCLient } from '../../services/prismic';

const post = {
	slug: 'my-new-post',
	title: 'my new post',
	content: '<p>Post excerpt</p>',
	updatedAt: '01 de Abril'
}

jest.mock('next-auth/client');

jest.mock('../../services/prismic');

describe('Post Page', () => {
	it('renders correctly', () => {
		render(<Post post={post} />)

		expect(screen.getByText("my new post")).toBeInTheDocument()
		expect(screen.getByText("Post excerpt")).toBeInTheDocument()
	});

	it('redirect user if no subscription is found', async () => {
		const getSessionMocked = mocked(getSession);

		getSessionMocked.mockResolvedValueOnce(null);

		const response = await getServerSideProps({
			params: { slug: 'my-new-post' }
		} as any);

		expect(response).toEqual(
			expect.objectContaining({
				redirect: expect.objectContaining({
					destination: '/',
				})
			})
		)
	});

	it('loads initial data', async () => {
		const getSessionMocked = mocked(getSession);

		const getPrismicClientMocked = mocked(getPrismicCLient);

		getPrismicClientMocked.mockReturnValueOnce({
			getByUID: jest.fn().mockResolvedValueOnce({
				data: {
					title: [
						{ type: 'heading', text: 'my new post' }
					],
					content: [
						{ type: 'paragraph', text: 'Post content' }
					],
				},
				last_publication_date: '04-01-2021'
			})
		} as any);

		getSessionMocked.mockResolvedValueOnce({
			activeSubscription: 'fake-active-subscription'
		} as any)

		const response = await getServerSideProps({
			params: { slug: 'my-new-post' }
		} as any);

		expect(response).toEqual(
			expect.objectContaining({
				props: {
					post: {
						slug: 'my-new-post',
						title: 'my new post',
						content: '<p>Post content</p>',
						updatedAt: '01 de abril de 2021'
					}
				}
			})
		)
	})
})