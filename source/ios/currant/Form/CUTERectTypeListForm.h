//
//  CUTERectTypeListForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <FXForms.h>
#import "CUTEPropertyInfoForm.h"

@interface CUTERectTypeListForm : NSObject <FXForm>

@property (strong, nonatomic) CUTEPropertyInfoForm *single;

@property (strong, nonatomic) CUTEPropertyInfoForm *whole;


@end
