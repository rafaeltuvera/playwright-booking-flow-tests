// (0-based month)
export type DateFormatOptions = {
    weekday?: 'narrow' | 'short' | 'long';
    year?: 'numeric' | '2-digit' | null;
    month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
    day?: 'numeric' | '2-digit';
};

export function formatDate(date: Date, timeFormat?: DateFormatOptions): string {
    const options: Intl.DateTimeFormatOptions = {
        weekday: timeFormat?.weekday ?? 'long',
        month: timeFormat?.month ?? 'long',
        day: timeFormat?.day ?? 'numeric',
        year: 'numeric',
    };

    // If year is explicitly set to null, remove it from options
    if (timeFormat?.year === null) {
        delete options.year;
    } else if (timeFormat?.year !== undefined) {
        options.year = timeFormat.year;
    }

    return date.toLocaleDateString('en-US', options);
}
