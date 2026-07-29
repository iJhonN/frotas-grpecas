export async function compressImage(file: File, maxWidth = 1280, quality = 0.7): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement("canvas")
                let width = img.width
                let height = img.height

                // Redimensiona proporcionalmente se a largura for maior que o limite
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width)
                    width = maxWidth
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext("2d")
                if (!ctx) return reject("Erro ao obter contexto do canvas")

                ctx.drawImage(img, 0, 0, width, height)

                // Converte para JPEG compactado
                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob)
                        else reject("Erro ao processar imagem")
                    },
                    "image/jpeg",
                    quality
                )
            }
            img.onerror = (err) => reject(err)
        }
        reader.onerror = (err) => reject(err)
    })
}