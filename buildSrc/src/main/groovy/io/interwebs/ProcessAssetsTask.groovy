package io.interwebs.doogie

import org.jsoup.Jsoup
import java.security.MessageDigest

import org.gradle.api.DefaultTask
import org.gradle.api.tasks.*

class ProcessAssetsTask extends DefaultTask {

    private def document
    private File processedCssFile
    private File processedJsFile

    @InputFile File sourceIndexFile
    @InputDirectory File watchDirectory

    @OutputDirectory File destinationAssetDir
    @OutputFile File destinationIndexFile

    @TaskAction
    void processAssets() {
        document = Jsoup.parse(sourceIndexFile.text)
        String indexPath = sourceIndexFile.absolutePath - sourceIndexFile.name

        def jsFiles = document.select("script[src]").collect {
            "${indexPath}/${it.attr('src').value}"
        }

        def cssFiles = document.select("link").collect {
            "${indexPath}/${it.attr('href').value}"
        }

        processedJsFile = processJs(jsFiles)
        processedCssFile = processCss(cssFiles)

        updateIndex()
    }


    private File combineAndHash(def files) {
        String content = ""
        String fileExtension = ""

        files.each {
            File file = new File(it)
            content += file.text + "\n"
            if (!fileExtension) {
                fileExtension = file.name.tokenize('.').last()
            }
        }

        Formatter hexHash = new Formatter()
        MessageDigest.getInstance("SHA-1").digest(content.bytes).each {
            b -> hexHash.format('%02x', b)
        }

        File destination = new File("${destinationAssetDir}/${hexHash}.${fileExtension}")
        destination.text = content

        return destination
    }

    private static getMinifiedFileName(File source) {
        String fileExtension = source.name.tokenize('.').last()
        return source.name.replace(fileExtension, "min.${fileExtension}")
    }

    private File processJs(def files) {
        File source = combineAndHash(files)
        String compressedFileName = getMinifiedFileName(source)
        String compressedFilePath = "${destinationAssetDir}/${compressedFileName}"

        project.exec {
            commandLine "ngmin", source.absolutePath, source.absolutePath
        }

        project.exec {
            commandLine "uglifyjs", source.absolutePath, '-o', compressedFilePath
        }

        return new File(compressedFilePath)
    }

    private File processCss(def files) {
        File source = combineAndHash(files)

        String compressedFileName = getMinifiedFileName(source)
        String compressedFilePath = "${destinationAssetDir}/${compressedFileName}"

        project.javaexec {
            classpath = project.configurations.compile
            main = 'com.yahoo.platform.yui.compressor.YUICompressor'
            args = ["-o", "${compressedFilePath}", source.absolutePath]
        }

        source.delete()

        return new File(compressedFilePath)
    }

    private void updateIndex() {
        destinationIndexFile.delete()
        destinationIndexFile.createNewFile()

        document.select("script[src], link").each { it.remove() }

        String relativePath = destinationIndexFile.toPath().parent.relativize(destinationAssetDir.toPath())
        relativePath = relativePath ? "${relativePath}/" : ""

        document.select("head").append("""
            <script src="${relativePath}${processedJsFile.name}" ></script>
            <link href="${relativePath}${processedCssFile.name}" rel="stylesheet" type="text/css" />
        """)

        destinationIndexFile.text = document.outerHtml()
    }

}