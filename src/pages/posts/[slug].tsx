import PostLayout from '../../layouts/Post'
import { GetStaticPaths, GetStaticProps } from 'next'
import { bundleMDX } from 'mdx-bundler'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkMdxCodeProps from '@/lib/remark-mdx-code-props.js'
import remarkAdmonitions from '@/lib/remark-admonitions.js'
import remarkLinkCard from '@/lib/remark-link-card'
import remarkReadingTime from 'remark-reading-time'
import remarkReadingMdxTime from 'remark-reading-time/mdx'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import path from 'path'
import { getAdjacentPosts, getAllPosts, getPostSlug } from '@/utils/post'

export default PostLayout

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  const posts = await getAllPosts()
  const paths = posts.map(post => {
    const slug = getPostSlug(post)

    return {
      params: { slug },
    }
  })

  return {
    paths,
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<any, { slug: string }> = async ({ params }) => {
  const { slug } = params!
  const { code, frontmatter } = await bundleMDX({
    file: path.resolve(process.cwd(), `./posts/${slug}.mdx`),
    cwd: path.resolve(process.cwd(), './posts'),
    mdxOptions(options, frontmatter) {
      // this is the recommended way to add custom remark/rehype plugins:
      // The syntax might look weird, but it protects you in case we add/remove
      // plugins in the future.
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        remarkGfm,
        remarkMdxCodeProps,
        remarkDirective,
        remarkAdmonitions,
        remarkLinkCard,
        remarkReadingTime,
        remarkReadingMdxTime,
        remarkMath,
      ]
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { class: 'anchor' } }],
        rehypeKatex,
      ]

      return options
    },
    esbuildOptions(options, frontmatter) {
      options.target = ['es2015']

      return options
    },
  })

  const { prev, next } = await getAdjacentPosts(slug)

  return {
    props: {
      code,
      frontmatter,
      prevPost: prev ? { link: `/posts/${prev.slug}`, title: prev.frontmatter.title } : null,
      nextPost: next ? { link: `/posts/${next.slug}`, title: next.frontmatter.title } : null,
    },
    revalidate: 60 * 60 * 24
  }
}
