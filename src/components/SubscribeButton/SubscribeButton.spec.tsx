import { render, screen, fireEvent } from '@testing-library/react'
import { SubscribeButton } from '.'
import { signIn, useSession } from 'next-auth/client'
import { mocked } from 'ts-jest/utils'
import { useRouter } from 'next/router'

jest.mock('next-auth/client')

jest.mock('next/router')

describe('SubscribeButton component', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    render(<SubscribeButton />)

    expect(screen.getByText('Subscribe new')).toBeInTheDocument()
  })

  it('redirects user to sign in when not authenticated', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    const signInMocked = mocked(signIn)

    render(<SubscribeButton />)
    const subscribeButton = screen.getByText('Subscribe new')

    fireEvent.click(subscribeButton)
    expect(signInMocked).toHaveBeenCalled()
  })

  it('redirects tp posts when user already has a subscription', () => {
    const useRouterMocked = mocked(useRouter)
    const useSessionMocked = mocked(useSession)
    const pushMock = jest.fn()

    useSessionMocked.mockReturnValueOnce([{
      user: { name: 'John Doe', email: 'john.doe@example.com'},
      activeSubscription: 'fake-active-subscription',
      expires: 'fake-expires'
    },
      false
    ])
    useRouterMocked.mockReturnValueOnce({
      push: pushMock
    } as any)

    render(<SubscribeButton />)
    const subscribeButton = screen.getByText('Subscribe new')

    fireEvent.click(subscribeButton)
    expect(pushMock).toHaveBeenCalledWith('/posts')
  })
})
