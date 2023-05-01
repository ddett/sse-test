<template>
	<div>
		<div>SSE/WS Test</div>
		<div>
			output:
			<ul>
				<li v-for="e in output">
					{{ e.data }}
				</li>
			</ul>
		</div>
	</div>
</template>

<script lang="js">
export default {
  name: 'Tutorial',

  data() {
    return {
      output: [],
      userId: Math.floor(Math.random() * 1e6)
    };
  },

  async mounted() {
    console.log('Component mounted.');

    this.$socketManager.connect();
    await this.$socketManager.ready();
    this.$socket.$on('socket', data => {
      console.log(`got ${data} from WebSocket`);
    });

		// connect websocket
		// const serverUrl = 'ws://localhost:8080';
		// const ws = new WebSocket(`${serverUrl}?userId=${this.userId}`);

    // const server = new URL(location).hostname;
    // const socket = new WebSocket(`ws://${server}:8080`);

    // socket.onopen = () => {
    //   console.log(`socket open`);
    // };

    // socket.onclose = (code, reason) => {
    //   console.log(`Disconnected from server. Code: ${code}, Reason: ${reason}`);
    // };

    // socket.onerror = error => {
    //   console.error('ws error', error);
    // };

    // socket.onmessage = msg => {
    //   console.log('ws received:', msg);
    //   this.output.push(msg);
		// }

  //   // this.evtSource = new EventSource('https://sse-express-test.herokuapp.com/sse');
  //   this.evtSource = new EventSource('/api/sse');
  //   this.evtSource.onerror = err => {
  //     console.error('EventSource error', err);
  //   }

  //   this.evtSource.onmessage = e => {
  //     if (e.data === '[DONE]') {
  //       // this is also what OpenAI uses to signal end of stream https://platform.openai.com/docs/api-reference/completions/create#completions/create-stream
  //       console.log('[DONE]', e);
  //       this.evtSource.close();
  //     } else {
  //       console.log('message', e);
  //       this.output.push(e);
  //     }
  //   };
  },

  beforeDestroy() {
    this.$socket.off('socket');
  }
}
</script>
