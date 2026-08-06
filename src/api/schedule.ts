import { ScraperContext, ApiResponse } from '../types/common';
import { buildResponse, handleError } from '../utils/response';
import { parseScheduleSection } from '../parser/schedule';

const cheerio = require('cheerio');

const DAY_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export async function fetchSchedule(ctx: ScraperContext, day?: string): Promise<ApiResponse> {
    try {
        const response = await ctx.client.get('/schedule/');
        const $ = cheerio.load(response.data);

        if (day) {
            const dayLower = day.toLowerCase();
            const daySection = $(`.sch_${dayLower}`);
            if (!daySection.length) {
                return buildResponse(false, null, `Day "${day}" not found`);
            }

            const dayData = { list: parseScheduleSection($, daySection, ctx.baseUrl) };
            return buildResponse(true, { [dayLower]: dayData });
        }

        const data: Record<string, { list: any[] }> = {};
        DAY_NAMES.forEach(name => {
            data[name] = { list: [] };
        });

        const scheduleSections = $('[class*="sch_"]');
        scheduleSections.each((_: any, section: any) => {
            const classNames = $(section).attr('class')?.split(' ') || [];
            let dayName: string | null = null;
            for (const className of classNames) {
                if (className.startsWith('sch_')) {
                    dayName = className.replace('sch_', '');
                    break;
                }
            }

            if (dayName && data[dayName]) {
                data[dayName].list = parseScheduleSection($, section, ctx.baseUrl);
            }
        });

        return buildResponse(true, { schedule: data });
    } catch (error) {
        return handleError(error, 'parse schedule');
    }
}
