<template>
	<div>
		<div>SSE Test</div>
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
      output: []
    };
  },

  mounted() {
    console.log('Component mounted.')

    this.evtSource = new EventSource('/api/sse');
    this.evtSource.onerror = err => {
      console.error('EventSource error', err);
    }

    this.evtSource.onmessage = e => {
      if (e.data === '[DONE]') {
        // this is also what OpenAI uses to signal end of stream https://platform.openai.com/docs/api-reference/completions/create#completions/create-stream
        console.log('[DONE]', e);
        this.evtSource.close();
      } else {
        console.log('message', e);
        this.output.push(e);
      }
    };
  }
}
</script>
