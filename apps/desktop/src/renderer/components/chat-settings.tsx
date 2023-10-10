import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Chat} from '@withbotshq/shared/schema'
import {FC} from 'react'
import {useConfigModel, useConfigTemperature} from '../hooks/use-config'
import {Button} from './button'

interface Props {
  currentChat: Chat | null
}

const ChatSettings: FC<Props> = props => {
  const queryClient = useQueryClient()
  const {query: modelQuery, mutation: modelMutation} = useConfigModel()
  const {query: temperatureQuery, mutation: temperatureMutation} =
    useConfigTemperature()

  const apiKeyQuery = useQuery({
    queryKey: ['config:openAIAPIKey'],
    queryFn: api.getOpenAIAPIKey
  })

  const setApiKey = useMutation({
    mutationFn: async (key: string) => api.setOpenAIAPIKey(key),
    onSuccess: () => queryClient.invalidateQueries(['config:openAIAPIKey'])
  })

  const setChatModel = useMutation({
    mutationFn: async (model: string) => {
      if (props.currentChat) {
        await api.setChatModel(props.currentChat.id, model || null)
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['chats'])
  })

  const setChatSystemMessage = useMutation({
    mutationFn: async (content: string) => {
      if (props.currentChat) {
        await api.setChatSystemMessage(props.currentChat.id, content || null)
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['chats'])
  })

  const setChatTemperature = useMutation({
    mutationFn: async (temperature: number | null) => {
      if (props.currentChat) {
        await api.setChatTemperature(props.currentChat.id, temperature)
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['chats'])
  })

  return (
    <div className="flex w-full flex-col gap-4 p-2">
      <div className="flex w-full flex-col gap-2">
        <h1 className="text-sm font-bold uppercase text-gray-600">
          App Settings
        </h1>
        <div>
          <h2 className="text-xs font-bold uppercase text-gray-500">
            OpenAI API Token
          </h2>

          <input
            className="w-full rounded border bg-transparent p-2 py-1 dark:text-white"
            type="password"
            placeholder="API Key"
            value={apiKeyQuery.data ?? ''}
            onChange={e => setApiKey.mutate(e.target.value)}
          />
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase text-gray-500">Model</h2>

          <select
            className="w-full rounded border bg-transparent p-2 py-1 dark:text-white"
            value={modelQuery.data?.key ?? 'gpt-3.5-turbo'}
            onChange={e => modelMutation.mutate(e.target.value)}
          >
            <option value="gpt-3.5-turbo">GPT-3.5-Turbo</option>
            <option value="gpt-4">GPT-4</option>
          </select>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase text-gray-500">
            Temperature
          </h2>

          <div className="flex gap-1">
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperatureQuery.data}
              onChange={e =>
                temperatureMutation.mutate(parseFloat(e.target.value))
              }
            />

            <p className="text-xs">{temperatureQuery.data}</p>
          </div>
        </div>
      </div>

      {props.currentChat && (
        <div className="flex w-full flex-col gap-2">
          <h1 className="text-sm font-bold uppercase text-gray-600">
            Chat Settings
          </h1>

          <div>
            <h2 className="text-xs font-bold uppercase text-gray-500">Model</h2>

            <select
              className="w-full rounded border bg-transparent p-2 py-1 dark:text-white"
              value={props.currentChat.config?.model?.key ?? ''}
              onChange={e => setChatModel.mutate(e.target.value)}
            >
              <option value="">App Default</option>
              <option value="gpt-3.5-turbo">GPT-3.5-Turbo</option>
              <option value="gpt-4">GPT-4</option>
            </select>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase text-gray-500">
              System Message
            </h2>

            <textarea
              className="w-full rounded border bg-transparent p-2 py-1 dark:text-white"
              value={props.currentChat.config?.systemMessage?.content ?? ''}
              onChange={e => setChatSystemMessage.mutate(e.target.value)}
            />
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase text-gray-500">
              Temperature
            </h2>

            <div className="flex gap-1">
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={
                  props.currentChat.config?.temperature ?? temperatureQuery.data
                }
                onChange={e =>
                  setChatTemperature.mutate(parseFloat(e.target.value))
                }
              />

              <p className="text-xs">
                {props.currentChat.config?.temperature ?? 'App Default'}
              </p>
            </div>

            <Button
              disabled={props.currentChat.config?.temperature === null}
              onClick={() => setChatTemperature.mutate(null)}
            >
              Use App Default
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export {ChatSettings}
