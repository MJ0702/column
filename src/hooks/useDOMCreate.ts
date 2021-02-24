import { onUnmounted } from 'vue'

function useDOMCreate (nodeId: string) {
  // 将组件添加在 body 中，否则会添加到 #app 的 container 元素中，不符合语义化
  const node = document.createElement('div')
  node.id = nodeId
  document.body.appendChild(node)
  onUnmounted(() => {
    document.body.removeChild(node)
  })
}

export default useDOMCreate
