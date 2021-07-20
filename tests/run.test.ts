import { run } from '../src/run'

test('run successfully', async () => {
  await expect(run({ name: 'foo' })).resolves.toBeUndefined()
})
