import React from 'react';

const TablePlanning = () => {
  const data = [
    {
      label: '売上高',
      values: [
        10977000,
        11836000,
        12036000,
        12236000,
        13436000,
        13900000,
        15200000,
        17900000,
        20250000,
        22660000,
        26770000,
        28650000,
        74421000,
        131430000,
        205851000,
        100.00,
      ],
    },
    {
      label: '売上',
      values: [
        10977000,
        11836000,
        12036000,
        12236000,
        13436000,
        13900000,
        15200000,
        17900000,
        20250000,
        22660000,
        26770000,
        28650000,
        74421000,
        131430000,
        205851000,
        100.00,
      ],
    },
    {
      label: '売上原価',
      values: Array(16).fill(0),
    },
    {
      label: '仕入高',
      values: Array(16).fill(0),
    },
    {
      label: '外注加工費',
      values: Array(16).fill(0),
    },
    {
      label: '商品仕入',
      values: Array(16).fill(0),
    },
    {
      label: '派遣人件費',
      values: Array(16).fill(0),
    },
    {
      label: '通信',
      values: Array(16).fill(0),
    },
    {
      label: '仕掛計上',
      values: Array(16).fill(0),
    },
    {
      label: '償却計上',
      values: Array(16).fill(0),
    },
    {
      label: '売上総利益',
      values: [
        10977000,
        11836000,
        12036000,
        12236000,
        13436000,
        13900000,
        15200000,
        17900000,
        20250000,
        22660000,
        26770000,
        28650000,
        74421000,
        131430000,
        205851000,
        100.00,
      ],
    },
    {
      label: '人件費',
      values: [
        8988562,
        9164497,
        9411725,
        9427824,
        9492218,
        9522115,
        9718748,
        10829552,
        21826033,
        15860364,
        18829406,
        20411668,
        56006941,
        97475771,
        153482712,
        74.56,
      ],
    },
    {
      label: '役員報酬',
      values: [
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        500000,
        3000000,
        3000000,
        6000000,
        2.91,
      ],
    },
    {
      label: '給与手当',
      values: [
        7382000,
        7535000,
        7750000,
        7764000,
        7820000,
        7846000,
        8017000,
        8983000,
        11666000,
        13358000,
        15940000,
        17316000,
        46097000,
        75280000,
        121377000,
        58.96,
      ],
    },
    {
      label: '賞与・燃料手当',
      values: [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        7000000,
        0,
        0,
        0,
        0,
        7000000,
        7000000,
        3.40,
      ],
    },
    {
      label: '法定福利費',
      values: [
        1071128,
        1093329,
        1124525,
        1126556,
        1134682,
        1138455,
        1163267,
        1303433,
        2602737,
        1938246,
        2312894,
        2512552,
        6688675,
        11833129,
        18521804,
        9.00,
      ],
    },
    {
      label: '福利厚生費',
      values: [
        35434,
        36168,
        37200,
        37267,
        37536,
        37661,
        38482,
        43118,
        57297,
        64118,
        76512,
        83117,
        221266,
        362644,
        583910,
        0.28,
      ],
    },
    {
      label: '経費',
      values: [
       3120357,
       3123784,
       3128600,
       3128914,
       3280168,
       3130750,
       3134581,
       3196219,
       3256318,
       3294219,
       3352056,
       3582878,
       18912573,
       19816271,
       38728844,
       18.81
      ],
    },
    {
      label: '消耗品費',
      values: [
       100000,
       100000,
       100000,
       100000,
       250000,
       100000,
       100000,
       100000,
       100000,
       100000,
       100000,
       100000,
       750000,
       600000,
       1350000,
       0.66,
      ],
    },
    {
      label: '賃借料',
      values: [
        1564000,
        1564000,
        1564000,
        1564000,
        1564000,
        1564000,
        1564000,
        1564000,
        1564000,
        1564000,
        1564000,
        1564000,
        9384000,
        9384000,
        18768000,
        9.12
      ],
    },
    {
      label: '保険料',
      values: [
        165357,
        168784,
        173600,
        173914,
        175168,
        175750,
        179581,
        201219,
        261318,
        299219,
        357056,
        387878,
        1032573,
        1686272,
        2718845,
        1.32,
      ],
    },
    {
      label: '租税公課',
      values: [
        164000,
        164000,
        164000,
        164000,
        164000,
        164000,
        164000,
        164000,
        164000,
        164000,
        164000,
        364000,
        984000,
        1184000,
        2168000,
        1.05,
      ],
    },
    {
      label: '減価償却費',
      values: [
        94000,
        94000,
        94000,
        94000,
        94000,
        94000,
        94000,
        94000,
        94000,
        94000,
        94000,
        94000,
        564000,
        564000,
        1128000,
        0.55,
      ],
    },
    {
      label: '旅費交通費',
      values: [
        100000,
        100000,
        100000,
        100000,
        100000,
        100000,
        100000,
        100000,
        100000,
        100000,
        100000,
        100000,
        600000,
        600000,
        1200000,
        0.58,
      ],
    },
    {
      label: '通信費',
      values: [
        227000,
        227000,
        227000,
        227000,
        227000,
        227000,
        227000,
        227000,
        227000,
        227000,
        227000,
        227000,
        1362000,
        1362000,
        2724000,
        1.32
      ],
    },
    {
      label: '水道光熱費',
      values: [
        160000,
        160000,
        160000,
        160000,
        160000,
        160000,
        160000,
        200000,
        200000,
        200000,
        200000,
        200000,
        960000,
        1160000,
        2120000,
        1.03,
      ],
    },
    {
      label: '支払手数料',
      values: [
        50000,
        50000,
        50000,
        50000,
        50000,
        50000,
        50000,
        50000,
        50000,
        50000,
        50000,
        50000,
        300000,
        300000,
        600000,
        0.29,
      ],
    },
    {
      label: '広告宣伝費',
      values: [
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        1200000,
        1200000,
        2400000,
        1.17,
      ],
    },
    {
      label: '接待交際費',
      values: [
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        200000,
        1200000,
        1200000,
        2400000,
        1.17,
      ],
    },
    {
      label: '支払報酬',
      values: [
       96000,
       96000,
       96000,
       96000,
       96000,
       96000,
       96000,
       96000,
       96000,
       96000,
       96000,
       96000,
       576000,
       576000,
       1152000,
       0.56,
      ],
    },
    {
      label: '販売及び一般管理費',
      values: [
        12108919,
        12288281,
        12540325,
        12556738,
        12772386,
        12652865,
        12853329,
        14025771,
        25082351,
        19154583,
        22181462,
        23994546,
        74919514,
        117292042,
        192211556,
        93.37,
      ],
    },
    {
      label: '営業利益 ①',
      values: [
        -1131919,
        -452281,
        -504325,
        -320738,
        663614,
        1247135,
        2346671,
        3874229,
        -4832351,
        3505417,
        4588538,
        4655454,
        -498514,
        14137958,
        13639444,
        6.63,
      ],
    },
    {
      label: '営業外収益',
      values: [
       
      ],
    },
    {
      label: '営業外費用',
      values: [
       
      ],
    },
    {
      label: '経常利益',
      values: [
       -1131919,
       -452281,
       -504325,
       -320738,
       663614,
       1247135,
       2346671,
       3874229,
       -4832351,
       3505417,
       4588538,
       4655454,
       -498514,
       14137958,
       13639444,
       6.63,
      ],
    },
    {
      label: '累計経常利益',
      values: [
       -1131919,
       -1584200,
       -2086525,
       -2409263,
       -1754649,
       -498514,
       1848157,
       5722386,
       890035,
       4395452,
       8983990,
       13639444,
       -498514,
       14137958,
       13639444,
       6.63,
      ],
    },
  ];
  const noIndentLabels = [
    '売上高',
    '売上原価',
    '売上総利益',
    '人件費',
    '経費',
    '販売及び一般管理費',
    '営業利益 ①',
    '経常利益',
    '累計経常利益',
  ];

  return (
    <div className="table-planning-container">
    <div className="table-planning">
      <table>
        <thead>
          <tr>
            <th>項目</th>
            <th className='orange-txt'>4月</th>
            <th className='orange-txt'>5月</th>
            <th className='orange-txt'>6月</th>
            <th className='orange-txt'>7月</th>
            <th className='orange-txt'>8月</th>
            <th className='orange-txt'>9月</th>
            <th className='light-txt'>10月</th>
            <th className='light-txt'>11月</th>
            <th className='light-txt'>12月</th>
            <th className='light-txt'>1月</th>
            <th className='light-txt'>2月</th>
            <th className='light-txt'>3月</th>
            <th className='sky-txt'>上期計</th>
            <th className='sky-txt'>下期計</th>
            <th className='sky-txt'>合計</th>
            <th className='total-txt'>売上比</th>
          </tr>
          <tr className='scnd-row'>
            <th className='borderless'></th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th>計画</th>
            <th className='total-txt'></th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td className={noIndentLabels.includes(item.label) ? 'no-indent' : 'indented-label'}>{item.label}</td>
              {item.values.map((value, valueIndex) => (
                <td key={valueIndex}>{value.toLocaleString()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default TablePlanning;