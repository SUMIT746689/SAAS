import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const Get = async (req, res, refresh_token) => {
  try {
    const { school_id } = refresh_token;
    const gallaryInfo = await prisma.websiteUi.findMany({
      where: {
        school_id
      }
      // include: {
      //   video_gallery: true
      //   parent: true
      // }
    });

    const buildTree = (arr, parent_id = null) => {
      const tree = [];
      arr
        .filter((item) => item.parent_id === parent_id)
        .forEach((item) => {
          const node = { label: item.english_title, id: item.id };
          const children = buildTree(arr, item.id);
          if (children.length) {
            // @ts-ignore
            node.sub_menu = children;
          }
          tree.push(node);
        });
      return tree;
    };

    const nestedStructure = buildTree(gallaryInfo);

    res.status(200).json({
      message: 'success',
      result: gallaryInfo,
      menus: [
        {
          label: 'Root',
          id: null
        },
        ...nestedStructure
      ]
    });
  } catch (err) {
    logFile.error(err.message);
    console.log(err.message);
    res.status(404).json({ error: err.message });
  }
};

export default authenticate(Get);
