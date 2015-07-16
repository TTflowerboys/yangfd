//
//  CUTEAreaForm.h
//  currant
//
//  Created by Foster Yin on 4/10/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEForm.h"
#import "CUTEArea.h"
#import "CUTETicketForm.h"

@interface CUTEAreaForm : CUTETicketForm

@property (strong, nonatomic) NSString *unitPresentation;

@property (nonatomic) CGFloat area;

- (NSString *)unit;

@end
