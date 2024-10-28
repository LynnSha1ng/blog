import { readdir, access, mkdir, unlink, stat } from 'node:fs/promises';
import { join as pathJoin } from 'node:path';

/**
 * 分批处理一个数组内的元素
 * @param target 目标数组
 * @param fn 对每个批次执行的函数
 */
async function _batchWork(target: any[], fn: (batch: any[]) => Promise<any>) {
  const BATCH_SIZE = parseInt(process.env.VITE_BATCH_SIZE!);
  for (let i = 0; i < target.length; i += BATCH_SIZE) {
    const batch = target.slice(i, i + BATCH_SIZE);
    await fn(batch);
  }
}

/**
 * 检查目录是否存在，是则清空当前目录下的所有文件
 * （不包括子目录），否则创建
 *
 * @param target 目标目录
 */
async function _checkTarget(target: string) {
  try {
    await access(target);
    const targetFiles = await readdir(target);
    if (targetFiles.length !== 0) {
      const deletePromises = targetFiles.map(async filename => {
        const stats = await stat(pathJoin(target, filename));
        if (stats.isFile()) {
          await unlink(pathJoin(target, filename));
        }
      });
      await _batchWork(deletePromises, batch => Promise.all(batch));
    }
  } catch (_) {
    await mkdir(target, { recursive: true });
  }
}

/**
 * 生成数据的总体流程，成功后返回在源目录中处理的的文件个数
 *
 * @param options 配置对象
 * @param options.sourceDir 源目录
 * @param options.targetDir 目标目录，用于生成数据前的检查
 * @param options.work 对每一批文件执行的操作
 */
export async function doGenDataWork(options: {
  sourceDir: string;
  targetDir?: string | string[];
  work: (batch: string[]) => Promise<void>;
}) {
  const { sourceDir, targetDir, work } = options;

  try {
    if (typeof targetDir === 'string') {
      await _checkTarget(targetDir);
    } else if (Array.isArray(targetDir)) {
      await Promise.all(targetDir.map(_checkTarget));
    }

    const files = await readdir(sourceDir);
    await _batchWork(files, work);
    return files.length;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
