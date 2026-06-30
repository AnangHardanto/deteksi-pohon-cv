import { useState } from 'react'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewURL, setPreviewURL] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fungsi untuk menangani saat gambar dipilih
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewURL(URL.createObjectURL(file))
      setResult(null) // Reset hasil jika ganti gambar
    }
  }

  // Fungsi untuk mengirim gambar ke Backend Python
  // Fungsi untuk mengirim gambar ke Backend Python
  const handleUpload = async () => {
    if (!selectedFile) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      // GANTI URL DI BAWAH DENGAN URL NGROK KAMU YANG SEDANG AKTIF SAAT INI
      const response = await fetch('https://deteksi-pohon-cv.vercel.app/', {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true' // <-- Tambahkan baris ini untuk bypass blokir Ngrok
        },
        body: formData,
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        alert(data.error || 'Terjadi kesalahan saat memprediksi.')
      }
    } catch (error) {
      console.error("Error:", error)
      alert('Gagal terhubung ke server backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-green-700 mb-6">
          Deteksi Jenis Pohon 🌳
        </h1>

        <div className="flex flex-col items-center space-y-4">
          <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-green-600 rounded-lg shadow-sm tracking-wide uppercase border border-blue cursor-pointer hover:bg-green-50">
            <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
            </svg>
            <span className="mt-2 text-base leading-normal">Pilih Foto Pohon</span>
            <input type='file' className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>

          {previewURL && (
            <img 
              src={previewURL} 
              alt="Preview" 
              className="w-full h-64 object-cover rounded-lg border"
            />
          )}

          <button 
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
              (!selectedFile || loading) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 transition'
            }`}
          >
            {loading ? 'Memproses...' : 'Deteksi Sekarang'}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-gray-600 text-sm mb-1">Hasil Prediksi:</p>
            <h2 className="text-2xl font-bold text-green-800">{result.prediksi}</h2>
            <p className="text-sm font-medium mt-2 text-gray-500">
              Tingkat Keyakinan: <span className="text-green-600">{result.akurasi}%</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App