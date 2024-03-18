import { useRouter } from 'next/router'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { AxiosError } from 'axios'
import { api } from '../../lib/axios'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react'
import { ArrowRight } from 'phosphor-react'

import { Container, Form, FormError, Header } from './styles'

const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, 'O nome de usuário precisa ter pelo menos 3 caracteres')
    .regex(
      /^[a-z0-9._-]+$/i,
      'O nome de usuário pode ter apenas letras e hifens',
    )
    .transform((username) => username.toLowerCase()),
  name: z.string().min(3, 'O nome precisa ter pelo menos 3 caracteres'),
})

type RegisterFormData = z.infer<typeof registerFormSchema>

export default function Register() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      name: '',
    },
  })

  const nameInput = watch('name')
  const nameInputMask = nameInput.replace(/\b\w/g, (firstCharacter) =>
    firstCharacter.toUpperCase(),
  )

  async function handleRegisterUser(data: RegisterFormData) {
    try {
      await api.post('/users', {
        name: data.name,
        username: data.username,
      })

      await router.push('/register/connect-calendar')
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data.message) {
        return alert(error.response.data.message)
      }

      console.error(error)
    }
  }

  useEffect(() => {
    if (router.query.username) {
      setValue('username', String(router.query.username))
    }
  }, [router.query?.username, setValue])

  return (
    <Container>
      <Header>
        <Heading as="strong"> Bem-vindo ao Ignite Call</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          editar essas informações depois.
        </Text>

        <MultiStep size={4} currentStep={1} />
      </Header>

      <Form as="form" onSubmit={handleSubmit(handleRegisterUser)}>
        <label>
          <Text size="sm">Nome de usuário</Text>
          <TextInput
            prefix="ignite.com/"
            placeholder="seu-usuario"
            crossOrigin=""
            onPointerEnterCapture=""
            onPointerLeaveCapture=""
            {...register('username')}
          />

          {errors.username && (
            <FormError size="sm">{errors.username.message}</FormError>
          )}
        </label>

        <label>
          <Text size="sm">Nome completo</Text>
          <TextInput
            placeholder="Digite seu nome completo!"
            value={nameInputMask}
            crossOrigin=""
            onPointerEnterCapture=""
            onPointerLeaveCapture=""
            {...register('name')}
          />

          {errors.name && (
            <FormError size="sm">{errors.name.message}</FormError>
          )}
        </label>

        <Button type="submit" disabled={isSubmitting}>
          Próximo passo <ArrowRight />
        </Button>
      </Form>
    </Container>
  )
}
