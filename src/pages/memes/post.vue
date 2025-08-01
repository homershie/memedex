<template>
  <div class="container mx-auto">
    <div class="bg-white overflow-hidden">
      <div class="text-center py-6">
        <h1 class="text-3xl font-bold text-gray-800">投稿迷因</h1>
        <p class="text-gray-600 mt-2">分享你的創意，讓大家一起歡樂！</p>
      </div>
      <div class="p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 迷因標題 -->
          <div class="field">
            <label for="title" class="block font-semibold mb-2">
              迷因標題 <span class="text-red-500">*</span>
            </label>
            <InputText
              id="title"
              v-model="form.title"
              placeholder="為你的迷因取個有趣的標題..."
              maxlength="200"
              required
              class="w-full"
              :class="{ 'p-invalid': errors.title }"
            />
            <small v-if="errors.title" class="p-error">{{
              errors.title
            }}</small>
          </div>

          <!-- 迷因型態 -->
          <div class="field">
            <label for="type" class="block font-semibold mb-2">
              迷因型態 <span class="text-red-500">*</span>
            </label>
            <Dropdown
              id="type"
              v-model="form.type"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="選擇迷因類型"
              class="w-full"
              appendTo="body"
              required
              :class="{ 'p-invalid': errors.type }"
            />
            <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
          </div>

          <!-- 迷因內容簡介 -->
          <div class="field">
            <label for="content" class="block font-semibold mb-2">
              迷因內容簡介 <span class="text-red-500">*</span>
            </label>
            <Textarea
              id="content"
              v-model="form.content"
              placeholder="簡單描述這個迷因的內容或梗點..."
              rows="4"
              maxlength="350"
              required
              class="w-full"
              :class="{ 'p-invalid': errors.content }"
            />
            <small v-if="errors.content" class="p-error">{{
              errors.content
            }}</small>
            <small
              class="text-gray-500"
              :class="{ 'text-red-500': getCharCount(form.content) > 350 }"
            >
              {{ getCharCount(form.content) }}/350
            </small>
          </div>

          <!-- 媒體內容 (根據類型顯示不同輸入方式) -->
          <div v-if="form.type !== 'text'" class="field">
            <label class="block font-semibold mb-2">
              <i :class="getTypeIcon(form.type)" class="mr-1"></i>
              {{ getMediaLabel(form.type) }}
              <span class="text-red-500">*</span>
            </label>

            <!-- 圖片上傳 -->
            <div v-if="form.type === 'image'" class="space-y-3">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 檔案上傳 -->
                <div>
                  <label class="block text-sm font-medium mb-2"
                    >上傳圖片檔案</label
                  >
                  <FileUpload
                    mode="basic"
                    name="image"
                    :maxFileSize="10000000"
                    accept="image/*"
                    :auto="false"
                    chooseLabel="選擇圖片"
                    class="w-full"
                    @select="onImageSelect"
                    @clear="onImageClear"
                  />
                  <small class="text-gray-500 mt-1 block">
                    支援 JPG, PNG, GIF, WebP (最大 10MB)
                  </small>
                </div>

                <!-- 或是連結（只有沒選檔案時才顯示） -->
                <div v-if="!uploadedImageFile">
                  <label class="block text-sm font-medium mb-2"
                    >或提供圖片連結</label
                  >
                  <InputText
                    v-model="form.image_url"
                    placeholder="https://example.com/image.jpg"
                    type="url"
                    class="w-full"
                    :class="{ 'p-invalid': errors.mediaUrl }"
                  />
                  <small class="text-gray-500 mt-1 block">
                    支援常見圖片網站：Imgur、Reddit、Discord 等
                  </small>
                </div>
              </div>

              <!-- 圖片預覽 -->
              <div v-if="form.image_url || uploadedImageUrl" class="mt-3">
                <label class="block text-sm font-medium mb-2">預覽</label>
                <div class="border rounded-lg p-2 bg-gray-50">
                  <img
                    :src="uploadedImageUrl || form.image_url"
                    alt="圖片預覽"
                    class="max-w-full max-h-64 rounded object-contain mx-auto"
                    @error="onImageError"
                    @load="imagePreviewError = false"
                  />
                  <div
                    v-if="imagePreviewError"
                    class="text-center text-red-500 p-4"
                  >
                    <i class="pi pi-exclamation-triangle text-2xl mb-2"></i>
                    <p>圖片載入失敗，請檢查連結是否正確</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 影片連結 -->
            <div v-else-if="form.type === 'video'" class="space-y-3">
              <InputText
                v-model="form.video_url"
                placeholder="https://youtube.com/watch?v=... 或其他影片平台連結"
                type="url"
                class="w-full"
                :class="{ 'p-invalid': errors.mediaUrl }"
              />
              <small class="text-gray-500">
                支援 YouTube、Vimeo、TikTok、Twitch 等影片平台連結
              </small>

              <!-- 影片預覽 -->
              <div v-if="form.video_url" class="mt-3">
                <label class="block text-sm font-medium mb-2">預覽</label>
                <div class="border rounded-lg p-2 bg-gray-50">
                  <div v-if="isYouTubeUrl(form.video_url)" class="aspect-video">
                    <iframe
                      :src="getYouTubeEmbedUrl(form.video_url)"
                      class="w-full h-full rounded"
                      allowfullscreen
                    ></iframe>
                  </div>
                  <div v-else class="text-center p-4 text-gray-500">
                    <i class="pi pi-video text-2xl mb-2"></i>
                    <p>影片連結：{{ form.video_url }}</p>
                    <small class="block mt-1"
                      >其他平台的影片將在發布後顯示</small
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- 音訊連結 -->
            <div v-else-if="form.type === 'audio'" class="space-y-3">
              <InputText
                v-model="form.audio_url"
                placeholder="https://youtube.com/watch?v=... 或其他音訊平台連結"
                type="url"
                class="w-full"
                :class="{ 'p-invalid': errors.mediaUrl }"
              />
              <small class="text-gray-500">
                支援 YouTube、SoundCloud、Spotify、Podcast 等音訊平台連結
              </small>

              <!-- 音訊預覽 -->
              <div v-if="form.audio_url" class="mt-3">
                <label class="block text-sm font-medium mb-2">預覽</label>
                <div class="border rounded-lg p-4 bg-gray-50">
                  <div v-if="isYouTubeUrl(form.audio_url)" class="aspect-video">
                    <iframe
                      :src="getYouTubeEmbedUrl(form.audio_url)"
                      class="w-full h-full rounded"
                      allowfullscreen
                    ></iframe>
                  </div>
                  <div v-else class="text-center text-gray-500">
                    <i class="pi pi-volume-up text-2xl mb-2"></i>
                    <p>音訊連結：{{ form.audio_url }}</p>
                    <small class="block mt-1"
                      >其他平台的音訊將在發布後顯示</small
                    >
                  </div>
                </div>
              </div>
            </div>

            <small v-if="errors.mediaUrl" class="p-error">{{
              errors.mediaUrl
            }}</small>
          </div>

          <!-- 標籤選擇與新增 -->
          <div class="field">
            <label class="block font-semibold mb-2">標籤</label>
            <div class="space-y-3">
              <!-- 已選標籤顯示 -->
              <div v-if="selectedTags.length" class="flex flex-wrap gap-2">
                <Chip
                  v-for="tag in selectedTags"
                  :key="tag._id || tag.name"
                  :label="tag.name"
                  removable
                  @remove="removeTag(tag)"
                  class="bg-blue-100 text-blue-800"
                />
              </div>

              <!-- 標籤輸入 -->
              <div class="flex gap-2">
                <AutoComplete
                  v-model="tagInput"
                  :suggestions="tagSuggestions"
                  @complete="searchTags"
                  @keydown.enter.prevent="addTag"
                  optionLabel="name"
                  placeholder="輸入標籤名稱..."
                  class="flex-1"
                  appendTo="body"
                />
                <Button
                  type="button"
                  icon="pi pi-plus"
                  label="新增"
                  @click="addTag"
                  :disabled="!tagInput.trim()"
                />
              </div>
              <small class="text-gray-500">
                輸入標籤名稱，按 Enter 或點擊新增。如果標籤不存在會自動建立。
              </small>
            </div>
          </div>

          <!-- 詳細介紹編輯器 -->
          <div class="field">
            <label class="block font-semibold mb-2">詳細介紹</label>
            <div class="overflow-hidden">
              <QuillEditor
                v-model:content="detailMarkdown"
                content-type="html"
                theme="snow"
                :options="editorOptions"
                class="min-h-[300px]"
              />
            </div>
            <small class="text-gray-500">
              支援富文本編輯，可以添加圖片、連結、表格等豐富內容。
            </small>
          </div>

          <!-- 其他選項 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- NSFW 選項 -->
            <div class="field">
              <div class="flex items-center">
                <Checkbox v-model="form.nsfw" inputId="nsfw" :binary="true" />
                <label for="nsfw" class="ml-2 font-medium">
                  成人/限制級內容 (NSFW)
                </label>
              </div>
              <small class="text-gray-500 block mt-1">
                勾選此項表示內容可能不適合工作場所觀看
              </small>
            </div>

            <!-- 語言選擇 -->
            <div class="field">
              <label for="language" class="block font-semibold mb-2"
                >語言</label
              >
              <Dropdown
                id="language"
                v-model="form.language"
                :options="languageOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                appendTo="body"
              />
            </div>
          </div>

          <!-- 來源網址 -->
          <div class="field">
            <label for="sourceUrl" class="block font-semibold mb-2"
              >來源網址</label
            >
            <InputText
              id="sourceUrl"
              v-model="form.source_url"
              placeholder="如果有引用來源，請提供原始網址..."
              type="url"
              class="w-full"
            />
            <small class="text-gray-500">選填，標註內容來源以示尊重</small>
          </div>

          <!-- 錯誤訊息 -->
          <Message v-if="submitError" severity="error" :closable="false">
            {{ submitError }}
          </Message>

          <!-- 送出按鈕 -->
          <div class="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              label="重設"
              icon="pi pi-refresh"
              severity="secondary"
              @click="resetForm"
              :disabled="loading"
            />
            <Button
              type="submit"
              label="發布迷因"
              icon="pi pi-send"
              :loading="loading"
              class="px-8"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
  <Toast />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'

// PrimeVue 組件
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import AutoComplete from 'primevue/autocomplete'
import Chip from 'primevue/chip'
import Message from 'primevue/message'
import FileUpload from 'primevue/fileupload'
import Toast from 'primevue/toast'

// VueQuill 編輯器
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// API 服務
import memeService from '@/services/memeService'
import tagService from '@/services/tagService'
import memeTagService from '@/services/memeTagService'

defineOptions({ name: 'PostMemePage' })

const toast = useToast()
const router = useRouter()

// 表單資料
const form = reactive({
  title: '',
  type: 'text',
  content: '',
  image_url: '',
  video_url: '',
  audio_url: '',
  nsfw: false,
  language: 'zh',
  source_url: '',
})

// 表單驗證錯誤
const errors = reactive({
  title: '',
  type: '',
  content: '',
  mediaUrl: '',
})

// 其他狀態
const uploadedImageUrl = ref('')
const imagePreviewError = ref(false)
const selectedTags = ref([])
const tagInput = ref('')
const tagSuggestions = ref([])
const allTags = ref([])
const detailMarkdown = ref('')
const loading = ref(false)
const submitError = ref('')
const uploadedImageFile = ref(null)

// 編輯器選項
const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // 文字格式
      ['blockquote', 'code-block'], // 引用、程式碼區塊
      [{ header: 1 }, { header: 2 }], // 標題
      [{ list: 'ordered' }, { list: 'bullet' }], // 列表
      [{ script: 'sub' }, { script: 'super' }], // 上標、下標
      [{ indent: '-1' }, { indent: '+1' }], // 縮排
      [{ direction: 'rtl' }], // 文字方向
      [{ size: ['small', false, 'large', 'huge'] }], // 字體大小
      [{ header: [1, 2, 3, 4, 5, 6, false] }], // 標題
      [{ color: [] }, { background: [] }], // 文字、背景顏色
      [{ font: [] }], // 字體
      [{ align: [] }], // 對齊方式
      ['clean'], // 清除格式
      ['link', 'image', 'video'], // 連結、圖片、影片
    ],
  },
  placeholder: '請輸入詳細介紹...',
  theme: 'snow',
}

// 選項資料
const typeOptions = [
  { label: '純文字', value: 'text', icon: 'pi pi-file-edit' },
  { label: '圖片/GIF', value: 'image', icon: 'pi pi-image' },
  { label: '影片', value: 'video', icon: 'pi pi-video' },
  { label: '音訊', value: 'audio', icon: 'pi pi-volume-up' },
]

const languageOptions = [
  { label: '繁體中文', value: 'zh' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
  { label: '한국어', value: 'ko' },
]

// 載入標籤資料
onMounted(async () => {
  try {
    const { data } = await tagService.getAll()
    allTags.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('載入標籤失敗:', error)
    allTags.value = [] // 確保是陣列
  }
})

// 工具函數
const getMediaLabel = (type) => {
  const labelMap = {
    image: '圖片內容',
    video: '影片內容',
    audio: '音訊內容',
  }
  return labelMap[type] || '媒體內容'
}

// 字元計數函數 - 適合中文字元計算
const getCharCount = (text) => {
  if (!text) return 0

  // 計算字元數，中文字元算 1 個字元
  // 這裡使用簡單的長度計算，因為中文字元在 JavaScript 中也是 1 個字元
  // 如果需要更複雜的計算（如考慮全形字元），可以進一步修改
  return text.length
}

// 圖片上傳處理
const onImageSelect = (event) => {
  const file = event.files[0]
  if (file) {
    uploadedImageFile.value = file
    // 本地預覽
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImageUrl.value = e.target.result
      form.image_url = ''
    }
    reader.readAsDataURL(file)
    // 不上傳，僅預覽
  }
}

const onImageClear = () => {
  uploadedImageUrl.value = ''
}

const onImageError = () => {
  imagePreviewError.value = true
}

// YouTube 支援 (影片和音訊都可以用)
const isYouTubeUrl = (url) => {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'))
}

const getYouTubeEmbedUrl = (url) => {
  let videoId = ''
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1].split('&')[0]
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0]
  }
  return `https://www.youtube.com/embed/${videoId}`
}

// 標籤相關函數
const searchTags = (event) => {
  const query = event.query.toLowerCase()
  tagSuggestions.value = Array.isArray(allTags.value)
    ? allTags.value.filter(
        (tag) =>
          tag.name.toLowerCase().includes(query) &&
          !selectedTags.value.some((selected) => selected.name === tag.name),
      )
    : []
}

const addTag = () => {
  const tagName =
    typeof tagInput.value === 'string'
      ? tagInput.value.trim()
      : tagInput.value?.name?.trim() || ''

  if (!tagName || tagName.length > 50) return

  // 檢查是否已選擇
  if (selectedTags.value.some((tag) => tag.name === tagName)) {
    tagInput.value = ''
    return
  }

  // 尋找現有標籤
  const existingTag = Array.isArray(allTags.value)
    ? allTags.value.find((tag) => tag.name === tagName)
    : null

  if (existingTag) {
    selectedTags.value.push(existingTag)
  } else {
    // 新標籤，先加入選擇清單，實際建立會在送出時處理
    selectedTags.value.push({ name: tagName, isNew: true })
  }

  tagInput.value = ''
}

const removeTag = (tagToRemove) => {
  const index = selectedTags.value.findIndex(
    (tag) => tag.name === tagToRemove.name,
  )
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
}

const getTypeIcon = (type) => {
  const iconMap = {
    image: 'pi pi-image',
    video: 'pi pi-video',
    audio: 'pi pi-volume-up',
  }
  return iconMap[type] || 'pi pi-file'
}

const getTypeName = (type) => {
  const nameMap = {
    image: '圖片',
    video: '影片',
    audio: '音訊',
  }
  return nameMap[type] || '未知'
}

// 表單驗證
const validateForm = () => {
  // 清空錯誤
  Object.keys(errors).forEach((key) => (errors[key] = ''))

  let isValid = true

  if (!form.title.trim()) {
    errors.title = '請輸入迷因標題'
    isValid = false
  }

  if (!form.content.trim()) {
    errors.content = '請輸入迷因內容簡介'
    isValid = false
  } else if (getCharCount(form.content) > 350) {
    errors.content = '內容簡介不能超過 350 個字元'
    isValid = false
  }

  // 檢查媒體內容
  if (form.type !== 'text') {
    if (form.type === 'image') {
      // 沒選檔案也沒填連結才報錯
      if (!uploadedImageFile.value && !form.image_url) {
        errors.mediaUrl = '請上傳圖片或提供圖片連結'
        isValid = false
      }
      // 如果有填連結，可加強合法性檢查（可選）
    } else {
      const urlField = `${form.type}_url`
      if (!form[urlField] || form[urlField].trim() === '') {
        errors.mediaUrl = `請提供${getTypeName(form.type)}連結`
        isValid = false
      }
    }
  }

  return isValid
}

// 重設表單
const resetForm = () => {
  Object.assign(form, {
    title: '',
    type: 'text',
    content: '',
    image_url: '',
    video_url: '',
    audio_url: '',
    nsfw: false,
    language: 'zh',
    source_url: '',
  })

  uploadedImageUrl.value = ''
  imagePreviewError.value = false
  selectedTags.value = []
  tagInput.value = ''
  detailMarkdown.value = ''
  submitError.value = ''

  Object.keys(errors).forEach((key) => (errors[key] = ''))
}

// 送出表單
const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  submitError.value = ''

  try {
    // 送出時才上傳圖片
    if (form.type === 'image' && uploadedImageFile.value) {
      const formData = new FormData()
      formData.append('image', uploadedImageFile.value) // key 必須是 'image'

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        // 不要加 headers: Content-Type
      })
      const data = await res.json()
      if (
        data.success &&
        data.url &&
        data.url.startsWith('https://res.cloudinary.com/')
      ) {
        form.image_url = data.url
      } else {
        throw new Error(data.message || '圖片上傳失敗')
      }
    }

    // 先檢查 isNew: true 的標籤是否已存在於 allTags
    for (let i = 0; i < selectedTags.value.length; i++) {
      const tag = selectedTags.value[i]
      if (tag.isNew) {
        const exist = Array.isArray(allTags.value)
          ? allTags.value.find(
              (t) =>
                t.name.trim().toLowerCase() === tag.name.trim().toLowerCase(),
            )
          : null
        if (exist) {
          // 用現有標籤取代 selectedTags 裡的 isNew 標籤
          selectedTags.value[i] = exist
        }
      }
    }

    // 準備新標籤
    const newTags = selectedTags.value.filter(
      (tag) =>
        tag.isNew &&
        !allTags.value.some(
          (t) => t.name.trim().toLowerCase() === tag.name.trim().toLowerCase(),
        ),
    )
    const createdTags = []

    // 建立新標籤
    for (const newTag of newTags) {
      try {
        const { data } = await tagService.create({ name: newTag.name })
        createdTags.push(data)
        // 更新本地標籤清單
        if (Array.isArray(allTags.value)) {
          allTags.value.push(data)
        }
      } catch (error) {
        console.error(`建立標籤 "${newTag.name}" 失敗:`, error)
      }
    }

    // 準備標籤快取和ID
    const allSelectedTags = [
      ...selectedTags.value.filter((tag) => !tag.isNew),
      ...createdTags,
    ]

    const tagIds = allSelectedTags.map((tag) => tag._id).filter(Boolean)
    const tagNames = allSelectedTags.map((tag) => tag.name)

    // 建立迷因
    const memeData = {
      ...form,
      detail_markdown: detailMarkdown.value,
      tags_cache: tagNames,
      // 標記為實質性修改，讓後端更新 modified_at
      _markAsModified: true,
    }

    // 清理空字串欄位，避免後端驗證問題
    if (memeData.image_url === '') memeData.image_url = undefined
    if (memeData.video_url === '') memeData.video_url = undefined
    if (memeData.audio_url === '') memeData.audio_url = undefined
    if (memeData.source_url === '') memeData.source_url = undefined

    const memeResponse = await memeService.create(memeData)

    // 修正：後端返回 {success: true, data: {迷因對象}, error: null}
    const meme = memeResponse.data.data

    // 檢查迷因ID是否存在
    if (!meme || !meme._id) {
      throw new Error('迷因創建失敗：沒有返回有效的迷因ID')
    }

    // 建立標籤關聯
    if (tagIds.length > 0) {
      // 使用可靠的逐一創建策略 (批量創建後端有bug)
      let successCount = 0

      for (const tagId of tagIds) {
        try {
          const singleData = { meme_id: meme._id, tag_id: tagId }
          await memeTagService.create(singleData)
          successCount++
        } catch {
          // 標籤關聯失敗，但不阻止迷因創建
        }
      }

      // 檢查標籤關聯結果
      if (successCount > 0 && successCount < tagIds.length) {
        toast.add({
          severity: 'success',
          summary: '部分標籤關聯成功',
          detail: `迷因創建成功，${successCount}/${tagIds.length} 個標籤關聯成功`,
          life: 5000,
        })
      } else if (successCount === 0) {
        toast.add({
          severity: 'warn',
          summary: '標籤關聯失敗',
          detail: '迷因創建成功，但標籤關聯失敗',
          life: 5000,
        })
      }
    }

    toast.add({
      severity: 'success',
      summary: '投稿成功！',
      detail: '你的迷因已成功發布，感謝分享！',
      life: 5000,
    })

    // 清空詳細介紹欄位
    detailMarkdown.value = ''

    // 跳轉到所有迷因頁面
    router.push('/memes/all')
  } catch (error) {
    console.error('投稿失敗:', error)
    submitError.value =
      error?.response?.data?.message || error.message || '投稿失敗，請稍後再試'

    toast.add({
      severity: 'error',
      summary: '投稿失敗',
      detail: submitError.value,
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}

.p-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* VueQuill 編輯器樣式 */
:deep(.quill-editor) {
  min-height: 300px;
}

:deep(.quill-editor .ql-editor) {
  outline: none;
  padding: 1rem;
}

:deep(.quill-editor .ql-container) {
  outline: none;
}
</style>

<route lang="yaml">
meta:
  title: '投稿迷因'
  login: required
  admin: false
</route>
