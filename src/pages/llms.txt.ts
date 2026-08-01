import type { APIRoute } from 'astro';
import { machineContext } from '~/data/machine';

export const GET: APIRoute = () =>
  new Response(machineContext() + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
