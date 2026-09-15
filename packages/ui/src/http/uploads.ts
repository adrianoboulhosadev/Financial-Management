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

/**
 * Drops an upload the form never got round to saving.
 *
 * The file goes up BEFORE the record is submitted, so closing a sheet without
 * saving — or swapping one receipt for another — used to leave the first file
 * on disk forever, with no row naming it and no way to find it again.
 *
 * It NEVER throws. A cleanup that failed is a file left on disk, which is
 * exactly where it already was; surfacing that to someone who is closing a
 * sheet would report a problem they have no part in and cannot act on. The
 * backend refuses anyway once a record points at the file, so a mistimed call
 * cannot take a receipt out from under a movement.
 */
async function discard(theme: 'receipts' | 'avatars', url: string): Promise<void> {
  // The stored URL is `/uploads/<theme>/<uuid.ext>`; the route is keyed on the
  // file name alone.
  const filename = url.split('/').pop()
  if (!filename) return

  try {
    await api().delete(`/upload/${theme}/${filename}`)
  } catch {
    // Deliberately silent — see above.
  }
}

/** Drops a receipt that was uploaded and then discarded before saving. */
export function discardReceipt(url: string): Promise<void> {
  return discard('receipts', url)
}

/** Drops a profile photo that was uploaded and then discarded before saving. */
export function discardAvatar(url: string): Promise<void> {
  return discard('avatars', url)
}
