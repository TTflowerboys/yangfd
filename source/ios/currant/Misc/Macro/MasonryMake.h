//
//  MasonryMake.h
//  BluePlate
//
//  Created by Foster Yin on 1/2/14.
//  Copyright (c) 2014 Brothers Bridge Technology. All rights reserved.
//

#ifndef BluePlate_MasonryMake_h
#define BluePlate_MasonryMake_h

#define MAS_SHORTHAND
#import <Masonry.h>

#define MakeBegin(view) [view makeConstraints:^(MASConstraintMaker *make) {

#define MakeLeftEqualTo(view) make.left.equalTo(view)
#define MakeRighEqualTo(view) make.right.equalTo(view)
#define MakeTopEqualTo(view) make.top.equalTo(view)
#define MakeBottomEqualTo(view) make.bottom.equalTo(view)
#define MakeWidthEqualTo(view) make.width.equalTo(view)
#define MakeHeightEqualTo(view) make.height.equalTo(view)
#define MakeCenterXEqualTo(view) make.centerX.equalTo(view)
#define MakeCenterYEqualTo(view) make.centerY.equalTo(view)
#define MakeCenterEqualTo(view) make.center.equalTo(view)
#define MakeEdgesEqualTo(view) make.edges.equalTo(view)
#define MakeSizeEqualTo(view) make.size.equalTo(view)

#define MakeLeftLessThanOrEqualTo(view) make.left.lessThanOrEqualTo(view)
#define MakeRightLessThanOrEqualTo(view) make.right.lessThanOrEqualTo(view)
#define MakeTopLessThanOrEqualTo(view) make.top.lessThanOrEqualTo(view)
#define MakeBottomLessThanOrEqualTo(view) make.bottom.lessThanOrEqualTo(view)
#define MakeWidthLessThanOrEqualTo(view) make.width.lessThanOrEqualTo(view)
#define MakeHeightLessThanOrEqualTo(view) make.height.lessThanOrEqualTo(view)

#define MakeLeftGreaterThanOrEqualTo(view) make.left.greaterThanOrEqualTo(view)
#define MakeRightGreaterThanOrEqualTo(view) make.right.greaterThanOrEqualTo(view)
#define MakeTopGreaterThanOrEqualTo(view) make.top.greaterThanOrEqualTo(view)
#define MakeBottomGreaterThanOrEqualTo(view) make.bottom.greaterThanOrEqualTo(view)
#define MakeWidthGreaterThanOrEqualTo(view) make.width.greaterThanOrEqualTo(view)
#define MakeHeightGreaterThanOrEqualTo(view) make.height.greaterThanOrEqualTo(view)

#define MakeEnd  }];

#define UpdateBegin(view) [view updateConstraints:^(MASConstraintMaker *make) {
#define UpdateEnd }];

#define SetupContraints [self setupContraints]
#define SetupContraintsBegin - (void)setupContraints {
#define SetupContraintsEnd }


//#define InitBegin(view) view = ({
//#define InitEnd });
//#define InitEnd(view, superView) }); [superView addSubview:view];

/*

 A Example

 MakeBegin(_innerContainer)
 MakeLeftEqualTo(@(CONTAINER_MARGIN));
 MakeRighEqualTo(@(-CONTAINER_MARGIN));
 MakeTopEqualTo(@(CONTAINER_MARGIN));
 MakeBottomEqualTo(@(-CONTAINER_MARGIN));
 MakeEnd
 */

#endif
