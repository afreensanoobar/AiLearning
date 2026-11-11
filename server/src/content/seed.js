import { Course } from "../models/course.js";
import { Lesson } from "../models/lesson.js";
import { Question } from "../models/question.js";
import { lessonContent, lessonContentKey } from "./lesson-content.js";
import { challengeQuestions, courses, regularQuestions } from "./seed-data.js";
export async function seedContent() {
    for (const courseSeed of courses) {
        const { lessons: lessonTitles, ...courseFields } = courseSeed;
        const course = await Course.findOneAndUpdate({ slug: courseFields.slug }, { $set: courseFields, $unset: { lessonCount: 1, durationMinutes: 1 } }, {
            upsert: true,
            returnDocument: "after",
            runValidators: true,
            setDefaultsOnInsert: true,
        });
        for (const [index, title] of lessonTitles.entries()) {
            const material = lessonContent[lessonContentKey(course.slug, title)];
            if (!material) {
                throw new Error(`Missing lesson content for ${course.slug}: ${title}`);
            }
            await Lesson.updateOne({ courseId: course._id, title }, {
                $set: {
                    courseId: course._id,
                    title,
                    order: index + 1,
                    ...material,
                    estimatedMinutes: 10,
                },
            }, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
        }
    }
    const questions = [...regularQuestions, ...challengeQuestions];
    for (const question of questions) {
        await Question.updateOne({ text: question.text }, {
            $set: {
                ...question,
                status: "active",
                source: "manual",
                createdBy: null,
            },
        }, { upsert: true, runValidators: true, setDefaultsOnInsert: true });
    }
    return {
        courses: courses.length,
        lessons: courses.reduce((total, course) => total + course.lessons.length, 0),
        questions: questions.length,
    };
}
