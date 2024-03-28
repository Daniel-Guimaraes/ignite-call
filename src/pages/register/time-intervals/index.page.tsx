import { Controller, Form, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { z } from 'zod'

import {
  convertTimeStringToMinutes,
  getWeekDays,
} from '../../../utils/functions'

import { ArrowRight } from 'phosphor-react'

import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@ignite-ui/react'

import {
  IntervalBox,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
  FormError,
} from './styles'
import { Container, Header } from '../styles'
import { api } from '../../../lib/axios'

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message:
        'Para prosseguir, você precisa selecionar ao menos um dia da semana!',
    })
    .transform((intervals) =>
      intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        }
      }),
    )
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message:
          'O horário de término deve ser pelo menos 1h distante do início.',
      },
    ),
})

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>

export default function TimeIntervals() {
  const {
    register,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
  })

  const { fields } = useFieldArray({
    name: 'intervals',
    control,
  })

  const weekDays = getWeekDays()

  const intervals = watch('intervals')

  async function handleTimeIntervals(data: TimeIntervalsFormOutput) {
    try {
      await api.post('/users/time-intervals', {
        intervals: data.intervals,
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Container>
      <Header>
        <Heading as="strong"> Quase lá</Heading>
        <Text>
          Defina o intervalo de horários que você esta disponível em cada dia da
          semana.
        </Text>

        <MultiStep size={4} currentStep={3} />
      </Header>
      <Form<TimeIntervalsFormInput, TimeIntervalsFormOutput>
        control={control}
        onSubmit={async ({ data }) => await handleTimeIntervals(data)}
      >
        <IntervalBox>
          <IntervalsContainer>
            {fields.map((field, index) => (
              <IntervalItem key={field.id}>
                <IntervalDay>
                  <Controller
                    name={`intervals.${index}.enabled`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true)
                        }}
                        checked={field.value}
                      />
                    )}
                  />
                  <Text>{weekDays[field.weekDay]}</Text>
                </IntervalDay>
                <IntervalInputs>
                  <TextInput
                    size="sm"
                    type="time"
                    step={60}
                    crossOrigin=""
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                    disabled={intervals[index].enabled === false}
                    {...register(`intervals.${index}.startTime`)}
                  />

                  <TextInput
                    size="sm"
                    type="time"
                    step={60}
                    crossOrigin=""
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                    disabled={intervals[index].enabled === false}
                    {...register(`intervals.${index}.endTime`)}
                  />
                </IntervalInputs>
              </IntervalItem>
            ))}
          </IntervalsContainer>

          {errors.intervals && (
            <FormError size="sm">{errors.intervals.root?.message}</FormError>
          )}

          <Button type="submit" disabled={isSubmitting}>
            Proximo passo <ArrowRight />
          </Button>
        </IntervalBox>
      </Form>
    </Container>
  )
}
