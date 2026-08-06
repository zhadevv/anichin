// Shared helper used by every example: pretty-print an ApiResponse and
// exit non-zero if the call failed, so `npx tsx examples/whatever.ts`
// gives a clear pass/fail signal on the command line.
export function report(label: string, res: { success: boolean; message: string | null; data: any }): void {
    if (!res.success) {
        console.error(`[${label}] failed:`, res.message);
        process.exitCode = 1;
        return;
    }
    console.log(`[${label}] ok`);
    console.log(JSON.stringify(res.data, null, 2));
}
