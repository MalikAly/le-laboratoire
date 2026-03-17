import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useCreateUser } from '../../hooks/useUsers'

const schema = z.object({
  username: z
    .string()
    .min(1, "Le nom d'utilisateur est requis")
    .max(150, "Le nom d'utilisateur est trop long"),
  email: z.string().min(1, "L'email est requis").email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  is_admin: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
}

export function UserForm({ isOpen, onClose }: UserFormProps) {
  const createUser = useCreateUser()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      is_admin: false,
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({ username: '', email: '', password: '', is_admin: false })
    }
  }, [isOpen, reset])

  async function onSubmit(values: FormValues) {
    await createUser.mutateAsync(values)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un utilisateur" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nom d'utilisateur"
          placeholder="jean.dupont"
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="jean@exemple.fr"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('is_admin')}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-700">Administrateur</p>
            <p className="text-xs text-gray-400">Accès complet à la gestion des utilisateurs</p>
          </div>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting || createUser.isPending}
          >
            Créer
          </Button>
        </div>
      </form>
    </Modal>
  )
}
