import { api } from './api'

/**
 * The two self-service uploads. The file goes up FIRST and only its URL is
 * saved on the record it belongs to — a receipt on `Transaction.attachmentUrl`,
 * a photo on `User.avatarUrl` — which is what keeps the file out of every
 * payload that carries the record afterwards.
 *
 * `body` is typed as FormData and built by the CALLER, because the two
 * platforms build it differently: the browser appends a real `File` from an
 * `<input type="file">`, and React Native appends `{ uri, name, type }`, which
 * is not a File at all but is what its fetch understands. The request itself —
 * route, auth, the shape of the answer — is identical, so it lives here once.
 *
 * The Content-Type is left UNSET on purpose: the runtime has to write it
 * itself, because a multipart body is only parseable with the `boundary` that
 * only the runtime knows. Setting 'multipart/form-data' by hand omits the
 * boundary and the server answers 400 on a request that looked right.
 */
async function upload(path: string, body: FormData): Promise<string> {
  const { data } = await api().post<{ url: string }>(path, body)
  return data.url
}

/** A movement's receipt: image or PDF, up to 10 MB (the backend's limit). It is
 * a DOCUMENT — never cropped, never re-encoded — so it goes up exactly as it
 * was picked. */
export function uploadReceipt(body: FormData): Promise<string> {
  return upload('/upload/receipts', body)
}

/** A profile photo: images only, up to 5 MB. */
export function uploadAvatar(body: FormData): Promise<string> {
  return upload('/upload/avatars', body)
}
