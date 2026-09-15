import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { uploadReceipt } from 'ui'
import { notify } from '@/lib/notify'

/**
 * Picking a receipt on a phone.
 *
 * Camera and gallery, and no document picker: on a phone a receipt is a PHOTO
 * of the nota in practically every case. The route also takes PDFs — that path
 * is the web's, where a PDF is what a bank actually hands you.
 *
 * The permission is requested by the picker itself (`launch*Async` prompts on
 * first use); a refusal simply returns cancelled, which is why there is no
 * separate denial branch to write.
 */
export function useReceiptField(onUploaded: (url: string) => void) {
  const [uploading, setUploading] = useState(false)
  const [choosing, setChoosing] = useState(false)

  const send = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true)
    try {
      const body = new FormData()
      // React Native's FormData takes this shape, not a File — its fetch turns
      // {uri,name,type} into the multipart part. Casting is the documented way;
      // the DOM's File type simply does not exist here.
      body.append('file', {
        uri: asset.uri,
        name: asset.fileName ?? `comprovante-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      } as unknown as Blob)

      onUploaded(await uploadReceipt(body))
    } catch (error) {
      notify.failure(error, 'Não foi possível enviar o comprovante.')
    } finally {
      setUploading(false)
    }
  }

  const pick = async (from: 'camera' | 'library') => {
    setChoosing(false)
    const result =
      from === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 })

    if (!result.canceled && result.assets[0]) await send(result.assets[0])
  }

  return {
    uploading,
    choosing,
    openChooser: () => setChoosing(true),
    closeChooser: () => setChoosing(false),
    pick,
  }
}
